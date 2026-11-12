import { useTranslation } from 'react-i18next'

// Label + input + mensaje de error, para usar con react-hook-form.
// error.message es una clave de i18n (ver validation/schemas.js), por eso se traduce con t().
export default function Field({ label, error, children }) {
  const { t } = useTranslation()
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="field-error">{t(error.message)}</p>}
    </div>
  )
}
