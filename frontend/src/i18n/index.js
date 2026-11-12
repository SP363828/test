import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import es from './locales/es.json'
import en from './locales/en.json'

const resources = {
  es: { translation: es },
  en: { translation: en },
}

// LanguageDetector: usa el idioma guardado en localStorage ("lang") o, si no hay, el del navegador.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true, // "es-UY" → "es"
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
    interpolation: { escapeValue: false },
  })

// Mantiene <html lang> al día para el navegador y los lectores de pantalla.
document.documentElement.lang = i18n.resolvedLanguage
i18n.on('languageChanged', (idioma) => { document.documentElement.lang = idioma })

export default i18n
