import { useEffect, useState } from 'react';
import LanguageGate from './LanguageGate';
import ReportForm from './ReportForm';
import { type LangCode } from './lib/i18n';

export default function App() {
  const [lang, setLang] = useState<LangCode | null>(null);

  useEffect(() => {
    if (lang) {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  if (!lang) {
    return <LanguageGate onPick={(l) => setLang(l)} />;
  }

  return (
    <ReportForm
      lang={lang}
      onChangeLang={(l) => setLang(l)}
      onRestart={() => {
        localStorage.removeItem('lang');
        setLang(null);
      }}
    />
  );
}
