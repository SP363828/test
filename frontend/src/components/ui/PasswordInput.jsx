import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Input de contraseña con botón para mostrar/ocultar.
// Las props (incluido el ref de register) se pasan directo al <input>.
export default function PasswordInput({ className = '', ...props }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input type={visible ? 'text' : 'password'} className={`input pr-11 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 px-3 text-ink-muted hover:text-ink dark:hover:text-paper"
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
