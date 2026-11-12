import { useState, useRef, useEffect } from 'react';
import {
  Building2, Home, Bird, Globe, ChevronDown, ChevronLeft, ChevronRight,
  UploadCloud, CheckCircle2, Loader2, Send, ClipboardList, AlertCircle,
  ImageIcon, FileText, Trash2,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import {
  COUNTRIES, WOONLOCATIES, KANTOORLOCATIES, BVZ_LOCATIES, CATEGORIEEN,
  type LocationType,
} from './lib/locations';
import { LANGUAGES, translations, interpolate, type LangCode } from './lib/i18n';

const MAX_FILES = 10;
const MAX_SIZE = 100 * 1024 * 1024;
const ALLOWED_EXT = /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|heic|heif|svg|mp4|mov|webm|avi|mp3|wav|ogg|m4a|aac)$/i;

type Errors = Partial<Record<'name' | 'locationType' | 'country' | 'location' | 'category' | 'description' | 'files', string>>;

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(' ');
}

interface Props {
  lang: LangCode;
  onChangeLang: (l: LangCode) => void;
  onRestart: () => void;
}

export default function ReportForm({ lang, onChangeLang, onRestart }: Props) {
  const t = translations[lang];
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [locationType, setLocationType] = useState<LocationType | null>(null);
  const [countryIdx, setCountryIdx] = useState<number>(-1);
  const [location, setLocation] = useState<string>('');
  const [categoryIdx, setCategoryIdx] = useState<number>(-1);
  const [description, setDescription] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const country = countryIdx >= 0 ? COUNTRIES[countryIdx] : '';
  const countryDisplay = countryIdx >= 0 ? t.countries[countryIdx] : '';
  const locationOptions =
    locationType === 'woonlocatie' ? (country ? WOONLOCATIES[country as keyof typeof WOONLOCATIES] : []) :
    locationType === 'kantoorlocatie' ? KANTOORLOCATIES :
    locationType === 'brook_valley_zoo' ? BVZ_LOCATIES : [];

  function validateStep(s: number): boolean {
    const e: Errors = {};
    if (s === 0) {
      if (!name.trim()) e.name = t.errName;
    }
    if (s === 1) {
      if (!locationType) e.locationType = t.errType;
      if (locationType === 'woonlocatie' && countryIdx < 0) e.country = t.errCountry;
      if (locationType && !location) e.location = t.errLocation;
    }
    if (s === 2) {
      if (categoryIdx < 0) e.category = t.errCategory;
      if (description.trim().length < 10) e.description = t.errDesc;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 2));
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function pickFiles(list: FileList | null) {
    if (!list) return;
    const chosen = Array.from(list);
    const nextFiles = [...files];
    const bad: string[] = [];
    for (const f of chosen) {
      if (nextFiles.length >= MAX_FILES) break;
      if (f.size > MAX_SIZE) { bad.push(`${f.name} (100 MB)`); continue; }
      if (!ALLOWED_EXT.test(f.name)) { bad.push(`${f.name}`); continue; }
      nextFiles.push(f);
    }
    setFiles(nextFiles);
    setErrors((e) => ({ ...e, files: bad.length ? `${t.errFilePrefix} ${bad.join(', ')}` : undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(i: number) {
    setFiles((fs) => fs.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (!validateStep(2)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          name: name.trim(),
          location_type: locationType!,
          country: locationType === 'woonlocatie' ? country : null,
          location,
          category: categoryIdx >= 0 ? CATEGORIEEN[categoryIdx] : '',
          description: description.trim(),
          extra_info: extraInfo.trim() || null,
          photo_count: files.length,
          photo_urls: null,
        })
        .select('id')
        .single();
      if (error) throw error;
      const reportId = data.id as string;
      if (files.length > 0) {
        const paths: string[] = [];
        for (const f of files) {
          const path = `${reportId}/${Date.now()}-${crypto.randomUUID()}-${f.name}`;
          const up = await supabase.storage.from('report-photos').upload(path, f);
          if (up.error) throw up.error;
          paths.push(path);
        }
        await supabase.from('reports').update({ photo_urls: paths }).eq('id', reportId);
      }
      setDoneId(reportId);
    } catch (err) {
      console.error('submit failed', err);
      setSubmitError(t.errSubmit);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(0);
    setName(''); setLocationType(null); setCountryIdx(-1); setLocation(''); setCategoryIdx(-1);
    setDescription(''); setExtraInfo(''); setFiles([]); setErrors({}); setDoneId(null);
    onRestart();
  }

  if (doneId) {
    return (
      <div className="min-h-screen bg-[#f6f7f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-lg w-full text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">{t.doneTitle}</h2>
          <p className="mt-2 text-neutral-600 leading-relaxed">{t.doneText}</p>
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            {t.doneAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-neutral-900">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">Facilitaire melding</p>
              <p className="text-xs text-neutral-500 leading-tight">Moonen Group of Companies | GreenStay | PrismaWorx | IPS</p>
            </div>
          </div>
          <div className="relative">
            <label htmlFor="lang" className="sr-only">{t.langLabel}</label>
            <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="lang"
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as LangCode)}
              className="appearance-none rounded-lg border border-neutral-300 bg-white pl-9 pr-8 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer hover:border-neutral-400 transition-colors"
            >
              {LANGUAGES.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Progress */}
          <div className="flex border-b border-neutral-200">
            {t.steps.map((label, i) => (
              <button
                key={label}
                onClick={() => { if (i < step && validateStep(i + 1)) { setErrors({}); setStep(i); } }}
                className={classNames(
                  'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  step === i ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : i < step ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-transparent text-neutral-400'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={classNames('w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold',
                    step === i ? 'bg-emerald-600 text-white' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400')}>
                    {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {step === 0 && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">{t.welcomeTitle}</h2>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{t.welcomeText}</p>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                    {t.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePh}
                    className={classNames(
                      'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
                      errors.name ? 'border-red-400 bg-red-50/50' : 'border-neutral-300'
                    )}
                  />
                  <p className="mt-1.5 text-xs text-neutral-500">{t.nameNote}</p>
                  {errors.name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.name}</p>}
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">{t.typeTitle}</h2>
                  <p className="mt-1 text-sm text-neutral-600">{t.typeDesc}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {([
                    { v: 'woonlocatie', label: t.woon, icon: Home },
                    { v: 'kantoorlocatie', label: t.kantoor, icon: Building2 },
                    { v: 'brook_valley_zoo', label: t.zoo, icon: Bird },
                  ] as const).map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setLocationType(v); setCountryIdx(-1); setLocation(''); }}
                      className={classNames(
                        'flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-sm font-medium transition-all',
                        locationType === v
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                      )}
                    >
                      <Icon className={classNames('w-6 h-6', locationType === v ? 'text-emerald-600' : 'text-neutral-400')} />
                      {label}
                    </button>
                  ))}
                </div>
                {errors.locationType && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.locationType}</p>}

                {locationType && (
                  <>
                    {locationType === 'woonlocatie' && (
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium mb-1.5">{t.countryLabel} <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <select
                            id="country"
                            value={countryIdx}
                            onChange={(e) => { setCountryIdx(Number(e.target.value)); setLocation(''); }}
                            className={classNames(
                              'w-full appearance-none rounded-lg border px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
                              errors.country ? 'border-red-400 bg-red-50/50' : 'border-neutral-300'
                            )}
                          >
                            <option value={-1}>{t.chooseCountry}</option>
                            {COUNTRIES.map((c, i) => <option key={c} value={i}>{t.countries[i]}</option>)}
                          </select>
                          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {errors.country && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.country}</p>}
                      </div>
                    )}

                    {locationType === 'woonlocatie' && (
                      <p className="text-sm text-neutral-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                        {interpolate(t.noteWoon, { country: countryDisplay })}
                      </p>
                    )}
                    {locationType === 'kantoorlocatie' && (
                      <p className="text-sm text-neutral-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">{t.noteKantoor}</p>
                    )}
                    {locationType === 'brook_valley_zoo' && (
                      <p className="text-sm text-neutral-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">{t.noteZoo}</p>
                    )}

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1.5">
                        {locationType === 'woonlocatie'
                          ? interpolate(t.woonLocationsLabel, { country: countryDisplay })
                          : locationType === 'kantoorlocatie' ? t.kantoorLocationsLabel : t.zooLocationsLabel}
                        {' '}<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          disabled={locationType === 'woonlocatie' && countryIdx < 0}
                          className={classNames(
                            'w-full appearance-none rounded-lg border px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-neutral-100 disabled:text-neutral-400',
                            errors.location ? 'border-red-400 bg-red-50/50' : 'border-neutral-300'
                          )}
                        >
                          <option value="">{t.chooseLocation}</option>
                          {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {errors.location && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.location}</p>}
                    </div>
                  </>
                )}
              </section>
            )}

            {step === 2 && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">{t.catTitle}</h2>
                  <p className="mt-1 text-sm text-neutral-600">{t.catDesc}</p>
                </div>
                <div>
                  <div className="relative">
                    <select
                      aria-label={t.catTitle}
                      value={categoryIdx}
                      onChange={(e) => setCategoryIdx(Number(e.target.value))}
                      className={classNames(
                        'w-full appearance-none rounded-lg border px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
                        errors.category ? 'border-red-400 bg-red-50/50' : 'border-neutral-300'
                      )}
                    >
                      <option value={-1}>{t.chooseCategory}</option>
                      {CATEGORIEEN.map((c, i) => <option key={c} value={i}>{t.cats[i]}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.category && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.category}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1.5">
                    {t.descLabel} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.descPh}
                    className={classNames(
                      'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none resize-y transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
                      errors.description ? 'border-red-400 bg-red-50/50' : 'border-neutral-300'
                    )}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.description}</p>}
                </div>

                <div>
                  <label htmlFor="extra" className="block text-sm font-medium mb-1.5">
                    {t.extraLabel} <span className="font-normal text-neutral-400">({t.optional})</span>
                  </label>
                  <textarea
                    id="extra"
                    rows={3}
                    value={extraInfo}
                    onChange={(e) => setExtraInfo(e.target.value)}
                    placeholder={t.extraPh}
                    className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none resize-y transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t.filesLabel} <span className="font-normal text-neutral-400">({t.optional})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-600 hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors"
                  >
                    <UploadCloud className="w-8 h-8 text-neutral-400" />
                    <span className="font-medium text-neutral-800">{t.upload}</span>
                    <span className="text-xs text-neutral-500">{t.uploadHint}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => pickFiles(e.target.files)}
                  />
                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
                          {/\.(jpe?g|png|gif|webp|heic|heif|svg)$/i.test(f.name)
                            ? <ImageIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                            : <FileText className="w-4 h-4 text-neutral-400 shrink-0" />}
                          <span className="truncate flex-1">{f.name}</span>
                          <span className="text-xs text-neutral-400 shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                          <button type="button" onClick={() => removeFile(i)} className="text-neutral-400 hover:text-red-600 transition-colors" aria-label={t.removeFile}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.files && <p className="mt-2 text-xs text-amber-700 flex items-start gap-1"><AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{errors.files}</p>}
                </div>
              </section>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-neutral-200 bg-neutral-50/60">
            <button
              onClick={back}
              disabled={step === 0 || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200/70 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> {t.prev}
            </button>
            {step < 2 ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-5 py-2 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50 transition-colors"
              >
                {t.next} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-5 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.sending}</>
                  : <><Send className="w-4 h-4" /> {t.send}</>}
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-neutral-400">{t.footer}</p>
      </main>
    </div>
  );
}
