-- Run this migration in the Supabase SQL Editor to enable generated feed posts.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'naverdade-images',
    'naverdade-images',
    true,
    20971520,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public Upload Generated Post Images" ON storage.objects;
CREATE POLICY "Public Upload Generated Post Images" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (
    bucket_id = 'naverdade-images'
    AND (storage.foldername(name))[1] = 'posts'
    AND lower(name) LIKE ANY (ARRAY['%.jpg', '%.jpeg', '%.png', '%.webp'])
);

DROP POLICY IF EXISTS "Public Update Generated Post Images" ON storage.objects;
CREATE POLICY "Public Update Generated Post Images" ON storage.objects
FOR UPDATE TO anon, authenticated
USING (
    bucket_id = 'naverdade-images'
    AND (storage.foldername(name))[1] = 'posts'
)
WITH CHECK (
    bucket_id = 'naverdade-images'
    AND (storage.foldername(name))[1] = 'posts'
    AND lower(name) LIKE ANY (ARRAY['%.jpg', '%.jpeg', '%.png', '%.webp'])
);
