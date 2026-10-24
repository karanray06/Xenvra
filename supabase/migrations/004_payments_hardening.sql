-- Migration 004: Payments Hardening, Single Fulfilment Path, and Security Enhancements
-- Phase A requirement: harden payment table, create atomic fulfil_payment RPC, drop insecure profile view policy

-- 1. Upgrade payments table schema
DO $$ 
BEGIN
  -- Rename razorpay columns to provider agnostic if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'razorpay_order_id') THEN
    ALTER TABLE public.payments RENAME COLUMN razorpay_order_id TO provider_order_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'razorpay_payment_id') THEN
    ALTER TABLE public.payments RENAME COLUMN razorpay_payment_id TO provider_payment_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'razorpay_signature') THEN
    ALTER TABLE public.payments RENAME COLUMN razorpay_signature TO provider_signature;
  END IF;
END $$;

-- Add new provider columns if they don't exist
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS amount_paise INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw_event JSONB;

-- Backfill amount_paise from amount_inr if null
UPDATE public.payments 
SET amount_paise = amount_inr * 100 
WHERE amount_paise IS NULL AND amount_inr IS NOT NULL;

-- Update status check constraint on payments
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('created', 'awaiting_payment', 'pending', 'processing', 'paid', 'completed', 'failed', 'expired', 'refunded', 'needs_review'));

-- Add unique indexes for idempotency
DROP INDEX IF EXISTS idx_payments_razorpay_order;
DROP INDEX IF EXISTS idx_payments_provider_order;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_order 
  ON public.payments (provider, provider_order_id) 
  WHERE provider_order_id IS NOT NULL;

DROP INDEX IF EXISTS idx_payments_provider_payment;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_payment 
  ON public.payments (provider, provider_payment_id) 
  WHERE provider_payment_id IS NOT NULL;

-- 2. Lock down payments table RLS:
-- Users can ONLY select their own rows. Inserts and updates are strictly SERVICE_ROLE ONLY.
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
CREATE POLICY "Service role can manage payments"
  ON public.payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Atomic single-path fulfilment database function: fulfil_payment
-- Must be SECURITY DEFINER and executable ONLY by service_role
CREATE OR REPLACE FUNCTION public.fulfil_payment(
  p_provider TEXT,
  p_order_id TEXT,
  p_payment_id TEXT,
  p_amount_paise INTEGER DEFAULT NULL,
  p_raw JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment RECORD;
  v_plan RECORD;
  v_entitlement RECORD;
  v_duration_days INTEGER := 30;
  v_new_end TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Lock payment row FOR UPDATE in this transaction
  SELECT * INTO v_payment
  FROM public.payments
  WHERE provider = p_provider 
    AND (provider_order_id = p_order_id OR (provider_order_id IS NULL AND id::text = p_order_id))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found for provider ' || p_provider || ' and order_id ' || p_order_id
    );
  END IF;

  -- 2. Check if already paid/completed (idempotency)
  IF v_payment.status IN ('paid', 'completed') THEN
    IF v_payment.provider_payment_id = p_payment_id THEN
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Payment already processed with identical payment ID',
        'order_id', p_order_id,
        'plan', v_payment.plan
      );
    ELSE
      -- Duplicate payment attempt with different payment ID -> flag for review
      UPDATE public.payments
      SET status = 'needs_review',
          raw_event = jsonb_build_object('conflict_attempt', p_raw, 'existing_payment_id', v_payment.provider_payment_id)
      WHERE id = v_payment.id;

      RETURN jsonb_build_object(
        'success', false,
        'error', 'Order already paid with different payment id. Flagged for review.'
      );
    END IF;
  END IF;

  -- 3. Check expiration
  IF v_payment.expires_at IS NOT NULL AND v_payment.expires_at < v_now THEN
    UPDATE public.payments
    SET status = 'expired',
        raw_event = p_raw
    WHERE id = v_payment.id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order has expired'
    );
  END IF;

  -- 4. Verify amount if provided
  IF p_amount_paise IS NOT NULL AND v_payment.amount_paise IS NOT NULL THEN
    IF p_amount_paise != v_payment.amount_paise THEN
      UPDATE public.payments
      SET status = 'needs_review',
          raw_event = jsonb_build_object('expected_paise', v_payment.amount_paise, 'received_paise', p_amount_paise, 'raw', p_raw)
      WHERE id = v_payment.id;

      RETURN jsonb_build_object(
        'success', false,
        'error', 'Payment amount mismatch. Flagged for review.'
      );
    END IF;
  END IF;

  -- 5. Mark payment as paid
  UPDATE public.payments
  SET status = 'paid',
      provider_payment_id = p_payment_id,
      paid_at = v_now,
      raw_event = p_raw
  WHERE id = v_payment.id;

  -- 6. Fetch plan details for duration
  SELECT * INTO v_plan
  FROM public.plans
  WHERE id = v_payment.plan;

  IF FOUND AND v_plan.duration_days IS NOT NULL THEN
    v_duration_days := v_plan.duration_days;
  END IF;

  -- 7. Lock and fetch current entitlement for user
  SELECT * INTO v_entitlement
  FROM public.entitlements
  WHERE user_id = v_payment.user_id
  FOR UPDATE;

  -- Calculate extension: max(now, current_period_end) + duration
  IF FOUND AND v_entitlement.status = 'active' AND v_entitlement.current_period_end IS NOT NULL AND v_entitlement.current_period_end > v_now THEN
    v_new_end := v_entitlement.current_period_end + (v_duration_days || ' days')::INTERVAL;
  ELSE
    v_new_end := v_now + (v_duration_days || ' days')::INTERVAL;
  END IF;

  -- Upsert entitlement
  INSERT INTO public.entitlements (user_id, plan, status, current_period_end, updated_at)
  VALUES (v_payment.user_id, v_payment.plan, 'active', v_new_end, v_now)
  ON CONFLICT (user_id) DO UPDATE
  SET plan = EXCLUDED.plan,
      status = 'active',
      current_period_end = EXCLUDED.current_period_end,
      updated_at = v_now;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'payment_id', p_payment_id,
    'plan', v_payment.plan,
    'user_id', v_payment.user_id,
    'current_period_end', v_new_end
  );
END;
$$;

-- Strictly revoke all permissions on fulfil_payment from public, anon, authenticated
REVOKE ALL ON FUNCTION public.fulfil_payment(TEXT, TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfil_payment(TEXT, TEXT, TEXT, INTEGER, JSONB) TO service_role;

-- 4. Fix profile_views spam policy (Undo migration 003 insecure policy)
DROP POLICY IF EXISTS "Anyone can insert profile views" ON public.profile_views;

-- Only service_role can insert profile views
DROP POLICY IF EXISTS "Service role can insert profile views" ON public.profile_views;
CREATE POLICY "Service role can insert profile views"
  ON public.profile_views FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 5. Atomic AI Credit Consuming Function
CREATE OR REPLACE FUNCTION public.consume_ai_credit(
  p_user_id UUID,
  p_action TEXT DEFAULT 'ai_improve'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_entitlement RECORD;
  v_plan RECORD;
  v_daily_limit INTEGER := 5;
  v_today_start TIMESTAMPTZ := date_trunc('day', NOW());
  v_used_today INTEGER := 0;
BEGIN
  -- Get user active plan
  SELECT * INTO v_entitlement
  FROM public.entitlements
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    v_daily_limit := 5; -- Free plan default
  ELSE
    SELECT * INTO v_plan FROM public.plans WHERE id = v_entitlement.plan;
    IF FOUND AND v_plan.max_ai_actions_daily IS NOT NULL THEN
      v_daily_limit := v_plan.max_ai_actions_daily;
    ELSE
      v_daily_limit := 50; -- Pro default
    END IF;
  END IF;

  -- Count usage today
  SELECT COUNT(*) INTO v_used_today
  FROM public.usage_events
  WHERE user_id = p_user_id 
    AND action = p_action 
    AND created_at >= v_today_start;

  IF v_used_today >= v_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Daily AI limit reached (' || v_used_today || '/' || v_daily_limit || '). Upgrade your plan for higher limits.',
      'used', v_used_today,
      'limit', v_daily_limit
    );
  END IF;

  -- Record usage event
  INSERT INTO public.usage_events (user_id, action, tokens)
  VALUES (p_user_id, p_action, 1);

  RETURN jsonb_build_object(
    'allowed', true,
    'used', v_used_today + 1,
    'limit', v_daily_limit
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_credit(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(UUID, TEXT) TO authenticated, service_role;

-- 6. Refund AI Credit Function (if upstream AI provider fails)
CREATE OR REPLACE FUNCTION public.refund_ai_credit(
  p_user_id UUID,
  p_action TEXT DEFAULT 'ai_improve'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Delete the latest usage event for this action within last 5 minutes
  DELETE FROM public.usage_events
  WHERE id = (
    SELECT id FROM public.usage_events
    WHERE user_id = p_user_id 
      AND action = p_action 
      AND created_at >= NOW() - INTERVAL '5 minutes'
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
$$;

REVOKE ALL ON FUNCTION public.refund_ai_credit(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refund_ai_credit(UUID, TEXT) TO authenticated, service_role;

-- 7. Public profile RPC: get_public_profile (SECURITY DEFINER)
-- Returns ONLY published resume data, never leaks private resumes or all resumes
CREATE OR REPLACE FUNCTION public.get_public_profile(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_profile RECORD;
  v_resume RECORD;
  v_res_data JSONB;
BEGIN
  -- Find public profile
  SELECT * INTO v_profile
  FROM public.public_profiles
  WHERE slug = p_slug AND is_published = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Find corresponding resume
  SELECT * INTO v_resume
  FROM public.resumes
  WHERE id = v_profile.resume_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_res_data := v_resume.data;

  -- If show_contact is false, redact email and phone
  IF NOT v_profile.show_contact THEN
    IF v_res_data ? 'contact' THEN
      v_res_data := jsonb_set(v_res_data, '{contact,email}', '""'::jsonb);
      v_res_data := jsonb_set(v_res_data, '{contact,phone}', '""'::jsonb);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'slug', v_profile.slug,
    'full_name', v_profile.full_name,
    'headline', v_profile.headline,
    'bio', v_profile.bio,
    'show_contact', v_profile.show_contact,
    'view_count', v_profile.view_count,
    'resume_id', v_profile.resume_id,
    'template_id', v_resume.template_id,
    'data', v_res_data,
    'created_at', v_profile.created_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT) TO anon, authenticated, service_role;
