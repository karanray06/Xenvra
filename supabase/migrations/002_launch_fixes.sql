-- =============================================
-- Xenvra: Launch Fixes & Hardening Migration (002)
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Ensure entitlements unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'entitlements_user_id_key'
  ) THEN
    ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2. User Creation Trigger (handles profiles + free entitlement automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  INSERT INTO public.entitlements (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users from auth.users
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.entitlements (user_id, plan, status)
SELECT id, 'free', 'active'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 3. Drop overly permissive open insert policies
DROP POLICY IF EXISTS "Service role can insert usage events" ON public.usage_events;
DROP POLICY IF EXISTS "Anyone can insert profile views" ON public.profile_views;

-- 4. Template ID default alignment, version column, and size check
ALTER TABLE public.resumes ALTER COLUMN template_id SET DEFAULT 'modern-1';
UPDATE public.resumes SET template_id = 'modern-1' WHERE template_id = 'modern' OR template_id IS NULL;

ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS design_json JSONB DEFAULT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_resume_data_size'
  ) THEN
    ALTER TABLE public.resumes ADD CONSTRAINT check_resume_data_size CHECK (pg_column_size(data) < 500000);
  END IF;
END $$;

-- 5. Realtime publication additions
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.entitlements;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 6. Explicit WITH CHECK on all FOR ALL policies
DROP POLICY IF EXISTS "Users can CRUD own resumes" ON public.resumes;
CREATE POLICY "Users can CRUD own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own resume versions" ON public.resume_versions;
CREATE POLICY "Users can CRUD own resume versions"
  ON public.resume_versions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own job applications" ON public.job_applications;
CREATE POLICY "Users can CRUD own job applications"
  ON public.job_applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own public profiles" ON public.public_profiles;
CREATE POLICY "Users can CRUD own public profiles"
  ON public.public_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Helper: current_plan(uid)
CREATE OR REPLACE FUNCTION public.current_plan(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_plan TEXT;
  v_status TEXT;
  v_period_end TIMESTAMPTZ;
BEGIN
  SELECT plan, status, current_period_end
  INTO v_plan, v_status, v_period_end
  FROM public.entitlements
  WHERE user_id = p_user_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN 'free';
  END IF;

  IF v_status <> 'active' THEN
    RETURN 'free';
  END IF;

  IF v_period_end IS NOT NULL AND v_period_end < NOW() THEN
    RETURN 'free';
  END IF;

  RETURN COALESCE(v_plan, 'free');
END;
$$;

-- 8. Plan enforcement trigger on resumes BEFORE INSERT
CREATE OR REPLACE FUNCTION public.check_resume_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_plan TEXT;
  v_max_resumes INTEGER;
  v_count INTEGER;
BEGIN
  v_current_plan := public.current_plan(NEW.user_id);

  SELECT max_resumes INTO v_max_resumes
  FROM public.plans
  WHERE id = v_current_plan;

  IF v_max_resumes IS NULL THEN
    v_max_resumes := 1;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.resumes
  WHERE user_id = NEW.user_id;

  IF v_count >= v_max_resumes THEN
    RAISE EXCEPTION 'Resume limit of % reached for plan %', v_max_resumes, v_current_plan
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_resume_limit ON public.resumes;
CREATE TRIGGER trigger_check_resume_limit
  BEFORE INSERT ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.check_resume_limit();
