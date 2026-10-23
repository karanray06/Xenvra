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
