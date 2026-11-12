// Genereert de dataprogramma's voor de Power Pages-export uit de bronbestanden
// van de app. Draai dit script opnieuw na wijzigingen in i18n.ts of locations.ts:
//   node scripts/generate-export-data.mjs
import { build } from 'esbuild';

await build({
  entryPoints: ['src/lib/i18n.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'MoonenI18n',
  outfile: 'power-pages-export/data-i18n.js',
  logLevel: 'silent',
});

await build({
  entryPoints: ['src/lib/locations.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'MoonenLocations',
  outfile: 'power-pages-export/data-locations.js',
  logLevel: 'silent',
});

console.log('power-pages-export/data-i18n.js en data-locations.js bijgewerkt');
