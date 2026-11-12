/*
# Enforce file type and size limits on report-photos bucket

1. Storage
- Bucket `report-photos`: file_size_limit 100MB; allowed mime types for Word, Excel,
  PowerPoint, PDF, images, video and audio (matching the form's allowed types).
2. Security
- Server-side enforcement so the client-side "accept" hints are not the only check.
*/

UPDATE storage.buckets
SET file_size_limit = 104857600,
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg','image/png','image/gif','image/webp','image/heic','image/heif','image/svg+xml',
      'video/mp4','video/quicktime','video/webm','video/x-msvideo',
      'audio/mpeg','audio/wav','audio/ogg','audio/webm','audio/mp4','audio/aac'
    ]
WHERE id = 'report-photos';
