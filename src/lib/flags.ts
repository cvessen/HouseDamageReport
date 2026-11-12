import type { LangCode } from './i18n';

// Flag images via flagcdn (ISO country codes); English maps to the UK flag.
const COUNTRY_CODES: Record<LangCode, string> = {
  nl: 'nl', en: 'gb', de: 'de', fr: 'fr', es: 'es', it: 'it', pt: 'pt',
  da: 'dk', sv: 'se', fi: 'fi', et: 'ee', lv: 'lv', lt: 'lt', pl: 'pl',
  cs: 'cz', sk: 'sk', hu: 'hu', ro: 'ro', bg: 'bg', el: 'gr', hr: 'hr',
  sl: 'si', mt: 'mt', ga: 'ie',
};

export function flagUrl(lang: LangCode): string {
  return `https://flagcdn.com/w80/${COUNTRY_CODES[lang]}.png`;
}

export function flagUrl2x(lang: LangCode): string {
  return `https://flagcdn.com/w160/${COUNTRY_CODES[lang]}.png`;
}
