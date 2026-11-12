import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/constants'

// Arma una frase legible a partir de lo que el usuario va completando (valores de watch()).
// Recibe t() como parámetro porque no es un componente (no puede usar hooks).
function describirCuando({ tipoRecurrencia, fechaInicio, fechaFin }, t) {
  if (!fechaInicio) return t('resumen.pickDate')
  const inicio = formatDate(fechaInicio)
  const fin = fechaFin ? formatDate(fechaFin) : '…'
  const dias = t('resumen.days', { returnObjects: true })
  switch (tipoRecurrencia) {
    case 'diaria': return t('resumen.daily', { inicio, fin })
    case 'semanal': return t('resumen.weekly', { dia: dias[new Date(fechaInicio).getUTCDay()], inicio, fin })
    case 'mensual': return t('resumen.monthly', { dia: new Date(fechaInicio).getUTCDate(), inicio, fin })
    default: return t('resumen.once', { inicio })
  }
}

// Resumen en vivo de la reserva antes de confirmar.
export default function ReservaResumen({ valores, cuposNuevos, esPlus }) {
  const { t } = useTranslation()
  const recursos = useSelector((state) => state.recursos.todos)
  const nombres = valores.resources.map((id) => recursos.find((r) => r._id === id)?.name).filter(Boolean)
  const horarios = [...valores.bloques].sort()

  return (
    <div className="rounded-xl bg-paper-alt p-4 dark:bg-night">
      <p className="eyebrow">{t('resumen.title')}</p>
      <p className="mt-1 leading-relaxed">
        {t('resumen.booking')}{' '}
        <strong>{nombres.length ? nombres.join(', ') : t('resumen.none')}</strong>
        {horarios.length > 0 && <> {t('resumen.at')} <strong>{horarios.join(', ')}</strong></>}
        {', '}{describirCuando(valores, t)}.
      </p>
      {esPlus && cuposNuevos > 0 && (
        <p className="mt-2 font-mono text-xs text-ink-muted dark:text-slate-400">{t('resumen.consumes', { count: cuposNuevos })}</p>
      )}
    </div>
  )
}
