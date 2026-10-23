-- =============================================
-- Xenvra: Initial Database Schema + RLS
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Profiles (auto-created on signup via auth callback)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 2. Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  template_id TEXT NOT NULL DEFAULT 'modern',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own resumes"
  ON resumes FOR ALL
  USING (auth.uid() = user_id);


-- 3. Resume Versions (for version history)
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);

ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own resume versions"
  ON resume_versions FOR ALL
  USING (auth.uid() = user_id);


-- 4. Plans (reference table)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_inr INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  max_resumes INTEGER NOT NULL DEFAULT 1,
  max_templates INTEGER NOT NULL DEFAULT 3,
  max_ai_actions_daily INTEGER NOT NULL DEFAULT 5,
  max_jd_tailorings_monthly INTEGER NOT NULL DEFAULT 0,
  max_cover_letters_monthly INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed plans
INSERT INTO plans (id, name, price_inr, duration_days, max_resumes, max_templates, max_ai_actions_daily, max_jd_tailorings_monthly, max_cover_letters_monthly, features) VALUES
  ('free', 'Free', 0, 0, 1, 3, 5, 0, 0, '["basic_ats_score", "pdf_watermark"]'),
  ('beginner', 'Beginner', 29, 30, 3, 999, 30, 5, 3, '["full_ats_score", "pdf_no_watermark"]'),
  ('pro', 'Pro', 49, 30, 999, 999, 999, 999, 999, '["full_ats_score", "pdf_no_watermark", "docx_export", "version_history", "public_profile", "app_tracker", "interview_prep"]')
ON CONFLICT (id) DO NOTHING;

-- Plans are readable by everyone (reference data)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON plans FOR SELECT USING (true);


-- 5. Entitlements / Subscriptions
CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL REFERENCES plans(id) DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_entitlements_user_id ON entitlements(user_id);

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entitlements"
  ON entitlements FOR SELECT
  USING (auth.uid() = user_id);


-- 6. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  plan TEXT NOT NULL REFERENCES plans(id),
  amount_inr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE UNIQUE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);


-- 7. Usage Events (AI actions, exports, etc.)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX idx_usage_events_user_action ON usage_events(user_id, action, created_at);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage events"
  ON usage_events FOR SELECT
  USING (auth.uid() = user_id);

-- Server-side insert only (via service role key) — no direct user insert
CREATE POLICY "Service role can insert usage events"
  ON usage_events FOR INSERT
  WITH CHECK (true);


-- 8. Job Applications (kanban tracker)
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  jd_text TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interview', 'offer', 'rejected')),
  notes TEXT DEFAULT '',
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own job applications"
  ON job_applications FOR ALL
  USING (auth.uid() = user_id);


-- 9. Public Profiles
CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX idx_public_profiles_slug ON public_profiles(slug);
CREATE INDEX idx_public_profiles_user_id ON public_profiles(user_id);

ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own public profiles"
  ON public_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are publicly readable"
  ON public_profiles FOR SELECT
  USING (visibility = 'public');


-- 10. Profile Views (analytics)
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_profile_id UUID NOT NULL REFERENCES public_profiles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_ua TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profile_views_profile ON profile_views(public_profile_id, created_at);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Profile owners can read their views
CREATE POLICY "Profile owners can read views"
  ON profile_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public_profiles
      WHERE public_profiles.id = profile_views.public_profile_id
      AND public_profiles.user_id = auth.uid()
    )
  );

-- Anyone can insert views (anonymous tracking)
CREATE POLICY "Anyone can insert profile views"
  ON profile_views FOR INSERT
  WITH CHECK (true);


-- =============================================
-- Helper: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at
  BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_profiles_updated_at
  BEFORE UPDATE ON public_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
-- =============================================
-- Migration 003: Complete Features Setup
-- Cover Letters, Public Profile Views, Job Tracker
-- =============================================

-- 1. Cover Letters Table
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Cover Letter',
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user ON public.cover_letters(user_id);
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own cover letters" ON public.cover_letters;
CREATE POLICY "Users can CRUD own cover letters"
  ON public.cover_letters FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Ensure Public Profile Views Policy Allows Anonymous Tracking
DROP POLICY IF EXISTS "Anyone can insert profile views" ON public.profile_views;
CREATE POLICY "Anyone can insert profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (true);

-- 3. Auto update trigger for cover_letters
DROP TRIGGER IF EXISTS update_cover_letters_updated_at ON public.cover_letters;
CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Add publication for job_applications and cover_letters
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cover_letters;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
