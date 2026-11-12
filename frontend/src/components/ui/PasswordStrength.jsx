import { useTranslation } from 'react-i18next'
import { Check, Circle } from 'lucide-react'

// Checklist en vivo de los requisitos de la contraseña (los mismos que valida Yup)
// más dos recomendaciones opcionales para hacerla más segura.
const REGLAS = [
  { label: 'password.min6', test: (pw) => pw.length >= 6, requerida: true },
  { label: 'password.number', test: (pw) => /\d/.test(pw), requerida: true },
  { label: 'password.upper', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'password.symbol', test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
]

export default function PasswordStrength({ password = '' }) {
  const { t } = useTranslation()
  if (!password) return null
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
      {REGLAS.map(({ label, test, requerida }) => {
        const ok = test(password)
        return (
          <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-ink dark:text-paper' : 'text-ink-muted dark:text-slate-500'}`}>
            {ok
              ? <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-menta text-ink"><Check size={10} strokeWidth={3} /></span>
              : <Circle size={14} className={requerida ? '' : 'opacity-50'} />}
            {t(label)}
          </li>
        )
      })}
    </ul>
  )
}
