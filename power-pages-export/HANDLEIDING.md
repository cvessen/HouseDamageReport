# Handleiding: formulier in Power Pages gebruiken

Deze map bevat een complete, zelfstandige versie van het facilitaire
meldingformulier (taalkeuze met vlaggen + 3-staps formulier + bestandsupload),
geschikt voor Microsoft Power Pages. Er is geen React, Vite of build-stap
nodig: alleen de vier bestanden hieronder.

## Bestanden

| Bestand | Wat het is |
|---|---|
| `data-i18n.js` | Alle 24 taalvertalingen (automatisch gegenereerd uit de app) |
| `data-locations.js` | Landen, locaties en categorieën (automatisch gegenereerd) |
| `report-form.js` | De formulierlogica (taalkeuze, stappen, validatie, verzenden) |
| `report-form.css` | De stijlen (klassen beginnen met `ppg-`, botsen niet met uw thema) |
| `page-template.html` | Voorbeeldpagina die alles samenstelt |

## De data-bestanden bijwerken

Als u later talen of locaties wijzigt in de app, draait u:

```
node scripts/generate-export-data.mjs
```

en kopieert u de twee `data-*.js` bestanden opnieuw naar Power Pages.

## Installatie in Power Pages

### Stap 1 — Web-bestanden aanmaken

In Power Pages Studio (of de oude Portal Management app): maak vier
**Web Files** aan op de website, met als bovenliggende pagina de homepage:

| Naam | Type | Inhoud |
|---|---|---|
| `data-i18n` | `application/javascript` | inhoud van `data-i18n.js` |
| `data-locations` | `application/javascript` | inhoud van `data-locations.js` |
| `report-form` | `application/javascript` | inhoud van `report-form.js` |
| `report-form-css` | `text/css` | inhoud van `report-form.css` |

Zet bij elk web-bestand "Partial URL" respectievelijk op:
`/data-i18n.js`, `/data-locations.js`, `/report-form.js`, `/report-form.css`.

### Stap 2 — Supabase-gegevens opzoeken

Open uw Supabase-projectdashboard:

- **URL**: Project Settings → API → "Project URL"
- **Anonieme sleutel**: Project Settings → API → "anon public" key

### Stap 3 — Pagina maken met de template

Maak een nieuwe pagina (of web template) en plak de inhoud van
`page-template.html` erin. Vervang in het configuratieblok:

```js
supabaseUrl:    'https://UW-PROJECT.supabase.co',
supabaseAnonKey: 'UW-ANON-KEY'
```

door de waarden uit stap 2. Publiceer de pagina.

### Stap 4 — Toegangsrechten

De web-bestanden moeten leesbaar zijn voor bezoekers (Web File access:
"Everyone", of via de standaard Web Role van de site). Het formulier zelf
stuurt de anonieme Supabase-sleutel mee; dat is normaal en veilig zolang
de RLS-regels in Supabase aan staan (die staan al goed in dit project:
bezoekers mogen alleen meldingen aanmaken en bestanden uploaden).

## Hoe het werkt na installatie

1. Bezoeker ziet de taalkeuzepagina met 24 vlaggen.
2. Na keuze opent het formulier in die taal, in drie stappen
   (gegevens → locatie → melding).
3. Bij verzenden maakt de pagina rechtstreeks een melding in de
   Supabase-tabel `reports` en uploadt bijlagen naar de opslagmap
   `report-photos`. Dat zijn precies dezelfde tabellen die deze app
   ook gebruikt, dus meldingen komen op dezelfde plek binnen.

## Bekende aandachtspunten

- **CORS**: Supabase staat standaard cross-origin requests toe; is dat in
  uw project aangepast, voeg dan het domein van uw Power Pages-site toe
  aan de toegestane origins.
- **Content Security Policy**: als uw Power Pages-omgeving een strikte CSP
  heeft, sta dan `https://flagcdn.com` (afbeeldingen) en de Supabase-URL
  (`connect-src`) expliciet toe.
- De taalkeuze wordt in Power Pages niet onthouden tussen pagina's; elke
  pagina die het formulier mount start bij de taalkeuze. Dat is
  bewust gekozen zodat elke bezoeker zijn eigen taal kiest.
