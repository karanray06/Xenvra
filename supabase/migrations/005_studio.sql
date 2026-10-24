-- ==============================================================================
-- Migration 005: Xenvra Studio Data Model (Designs, Assets, Storage RLS)
-- ==============================================================================

-- 1. Designs Table
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('resume', 'deck', 'cover_letter', 'poster', 'social', 'card', 'certificate', 'banner', 'custom')),
    title TEXT NOT NULL,
    doc JSONB NOT NULL,
    schema_version INT NOT NULL DEFAULT 1,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    thumb_path TEXT,
    version INT NOT NULL DEFAULT 1,
    is_template BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT doc_size_limit CHECK (pg_column_size(doc) < 2000000)
);

-- Indexes for performance (user designs list & templates search)
CREATE INDEX IF NOT EXISTS idx_designs_user_updated ON public.designs(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_designs_kind ON public.designs(kind);
CREATE INDEX IF NOT EXISTS idx_designs_templates ON public.designs(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_designs_resume_id ON public.designs(resume_id) WHERE resume_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for designs
DROP POLICY IF EXISTS "Users can view own designs or public templates" ON public.designs;
CREATE POLICY "Users can view own designs or public templates"
    ON public.designs FOR SELECT
    USING (auth.uid() = user_id OR is_template = true);

DROP POLICY IF EXISTS "Users can insert own designs" ON public.designs;
CREATE POLICY "Users can insert own designs"
    ON public.designs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own designs" ON public.designs;
CREATE POLICY "Users can update own designs"
    ON public.designs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own designs" ON public.designs;
CREATE POLICY "Users can delete own designs"
    ON public.designs FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Assets Table (Uploads, Images, Stickers)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bucket_path TEXT NOT NULL,
    mime TEXT NOT NULL,
    bytes BIGINT NOT NULL,
    width INT,
    height INT,
    sha256 TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_user_created ON public.assets(user_id, created_at DESC);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
CREATE POLICY "Users can view own assets"
    ON public.assets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assets" ON public.assets;
CREATE POLICY "Users can insert own assets"
    ON public.assets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;
CREATE POLICY "Users can delete own assets"
    ON public.assets FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Migration: Seed existing resumes.design_json into designs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'resumes' 
          AND column_name = 'design_json'
    ) THEN
        INSERT INTO public.designs (user_id, kind, title, doc, resume_id, created_at, updated_at)
        SELECT 
            r.user_id,
            'resume',
            COALESCE(r.title, 'Untitled Resume Design'),
            CASE 
                WHEN jsonb_typeof(r.design_json) = 'object' THEN r.design_json
                ELSE jsonb_build_object(
                    'pages', jsonb_build_array(
                        jsonb_build_object(
                            'id', 'page-1',
                            'name', 'Page 1',
                            'width', 794,
                            'height', 1123,
                            'background', '#FFFFFF',
                            'elements', jsonb_build_array()
                        )
                    )
                )
            END,
            r.id,
            r.created_at,
            r.updated_at
        FROM public.resumes r
        WHERE r.design_json IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM public.designs d WHERE d.resume_id = r.id
          );
    END IF;
END $$;
