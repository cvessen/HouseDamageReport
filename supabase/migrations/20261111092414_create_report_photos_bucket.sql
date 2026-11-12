/*
# Create private storage bucket for report attachments

1. Storage
- Bucket `report-photos` (private).
  - Only images and video are allowed.
  - Max 100MB per file (handled in app).
  - Files stored under folder per report: `{report_id}/filename`.
2. Security
- RLS on storage.objects: anon/authenticated may upload files into a report folder and
  read files only from an existing report folder.
- Grant DELETE so files can be removed when a report is deleted.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "report_photos_insert" ON storage.objects;
CREATE POLICY "report_photos_insert" ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'report-photos'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

DROP POLICY IF EXISTS "report_photos_select" ON storage.objects;
CREATE POLICY "report_photos_select" ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'report-photos'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

DROP POLICY IF EXISTS "report_photos_delete" ON storage.objects;
CREATE POLICY "report_photos_delete" ON storage.objects FOR DELETE
TO anon, authenticated
USING (
  bucket_id = 'report-photos'
  AND (storage.foldername(name))[1] ~ '^[0-9a-hidden{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);
