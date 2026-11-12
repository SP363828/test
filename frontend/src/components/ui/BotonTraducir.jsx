import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import Spinner from './Spinner'

// Alterna entre el texto original y su traducción. Recibe lo que devuelve useTraduccion().
export default function BotonTraducir({ traduccion, className = '' }) {
  const { t } = useTranslation()
  const { activa, cargando, alternar } = traduccion

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={cargando}
      className={`inline-flex items-center gap-1 text-xs text-ink-muted underline underline-offset-4 hover:text-ink dark:text-slate-400 dark:hover:text-paper ${className}`}
    >
      {cargando ? <Spinner size={12} /> : <Languages size={12} />}
      {activa ? t('traduccion.verOriginal') : t('traduccion.traducir')}
    </button>
  )
}
