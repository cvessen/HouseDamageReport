/*
# Allow updating attachment paths on own report

1. Security
- Grant UPDATE on `reports` limited to the attachment columns only
  (`photo_urls`, `photo_count`) for anon + authenticated.
- Add UPDATE policy (row-level, single-tenant no-auth app) so the app can
  register uploaded file paths after uploading to storage.
- All other columns stay non-updatable for clients.
*/

REVOKE UPDATE ON reports FROM anon, authenticated;
GRANT UPDATE (photo_urls, photo_count) ON reports TO anon, authenticated;

DROP POLICY IF EXISTS "reports_update_attachments" ON reports;
CREATE POLICY "reports_update_attachments" ON reports FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
