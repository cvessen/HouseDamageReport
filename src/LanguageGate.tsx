import { Building2 } from 'lucide-react';
import { LANGUAGES, type LangCode } from './lib/i18n';
import { flagUrl, flagUrl2x } from './lib/flags';

interface Props {
  onPick: (lang: LangCode) => void;
}

export default function LanguageGate({ onPick }: Props) {
  function handlePick(lang: LangCode) {
    onPick(lang);
  }

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-neutral-900">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Facilitaire melding</p>
            <p className="text-xs text-neutral-500 leading-tight">Moonen Group of Companies | GreenStay | PrismaWorx | IPS</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Kies uw taal</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Choisissez votre langue · Choose your language · Wählen Sie Ihre Sprache · Elija su idioma
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {LANGUAGES.map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => handlePick(code)}
                className="group flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-left text-sm font-medium text-neutral-800 hover:border-emerald-600 hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
              >
                <img
                  src={flagUrl(code)}
                  srcSet={`${flagUrl2x(code)} 2x`}
                  width={28}
                  height={21}
                  alt=""
                  className="rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] shrink-0"
                />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs text-neutral-400 text-center">
            Klik op uw taal om door te gaan naar de melding. Click on your language to continue to the report.
          </p>
        </div>
      </main>
    </div>
  );
}
