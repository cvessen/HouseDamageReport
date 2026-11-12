/*
# Create reports table (single-tenant, no auth)

1. New Tables
- `reports` — facilitaire meldingen van medewerkers over locaties.
  - `id` (uuid, primary key)
  - `name` (text, not null) — naam van melder
  - `location_type` (text, not null) — 'woonlocatie' | 'kantoorlocatie' | 'brook_valley_zoo'
  - `country` (text, nullable) — alleen voor woonlocaties: 'België' | 'Nederland' | 'Duitsland'
  - `location` (text, not null) — specifieke locatie/adres
  - `category` (text, not null) — meldingscategorie
  - `description` (text, not null) — omschrijving van de melding
  - `extra_info` (text, nullable) — extra toelichting/opmerkingen
  - `photo_count` (integer, not null, default 0) — aantal bijgevoegde bestanden
  - `photo_urls` (text array, nullable) — paden van bijgevoegde bestanden in storage
  - `status` (text, not null, default 'nieuw') — 'nieuw' | 'in_behandeling' | 'afgerond'
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `reports`.
- Grant INSERT to `anon` + `authenticated` (melders zijn niet ingelogd).
- Grant SELECT to `anon` + `authenticated` (medewerkers kunnen meldingen teruglezen).
- Policies TO anon, authenticated omdat de app geen login heeft.
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_type text NOT NULL,
  country text,
  location text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  extra_info text,
  photo_count integer NOT NULL DEFAULT 0,
  photo_urls text[],
  status text NOT NULL DEFAULT 'nieuw',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON reports TO anon, authenticated;

DROP POLICY IF EXISTS "reports_select" ON reports;
CREATE POLICY "reports_select" ON reports FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reports_insert" ON reports;
CREATE POLICY "reports_insert" ON reports FOR INSERT
TO anon, authenticated WITH CHECK (true);
