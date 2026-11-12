/*
# Fix report-photos delete policy (typo in uuid regex) and enforce limits

1. Fix
- Replace "report_photos_delete" policy: regex had a typo that made it reject everything.
2. Limits
- CHECK on `reports.photo_count`: 0..10 bestanden (formulier: max 10, max 100MB per bestand).
*/

DROP POLICY IF EXISTS "report_photos_delete" ON storage.objects;
CREATE POLICY "report_photos_delete" ON storage.objects FOR DELETE
TO anon, authenticated
USING (
  bucket_id = 'report-photos'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

ALTER TABLE reports
  ADD CONSTRAINT reports_photo_count_range CHECK (photo_count >= 0 AND photo_count <= 10);
