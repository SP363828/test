import { useTranslation } from 'react-i18next'

// Selector ES / EN con el idioma actual resaltado.
// i18n.changeLanguage() cambia el idioma y el LanguageDetector lo guarda en localStorage.
export default function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const actual = i18n.resolvedLanguage

  return (
    <div className="flex rounded-full border border-line p-0.5 font-mono text-[11px] dark:border-night-line" role="group" aria-label={t('nav.language')}>
      {['es', 'en'].map((lng) => (
        <button
          key={lng}
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={actual === lng}
          className={`rounded-full px-2.5 py-1 uppercase ${actual === lng ? 'bg-ink text-paper dark:bg-paper dark:text-ink' : 'text-ink-muted'}`}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
