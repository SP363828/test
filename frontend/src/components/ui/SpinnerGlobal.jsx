import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Spinner from './Spinner'

// Overlay de carga que se muestra cuando state.spinner.cargando es true. Se monta una sola vez en AppLayout.
export default function SpinnerGlobal() {
  const { t } = useTranslation()
  const cargando = useSelector((state) => state.spinner.cargando)

  if (!cargando) return null
  return (
    <div role="status" className="fixed inset-0 z-40 grid place-items-center bg-paper/60 backdrop-blur-sm dark:bg-night/60">
      <div className="flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper dark:bg-paper dark:text-ink">
        <Spinner size={18} /> {t('common.loading')}
      </div>
    </div>
  )
}
