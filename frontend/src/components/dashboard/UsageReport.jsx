import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { countUsedSlots, LIMITE_PLAN_PLUS } from '../../utils/constants'

// Informe de uso: % de cupos usados (plus) o cantidad de reservas (premium).
export default function UsageReport() {
  const { t } = useTranslation()
  const usuario = useSelector((state) => state.auth.usuario)
  const reservas = useSelector((state) => state.reservas.todas)

  if (usuario?.plan === 'premium' || usuario?.rol === 'admin') {
    return (
      <div className="card">
        <p className="eyebrow">{t('usage.premium')}</p>
        <p className="mt-3 text-5xl font-bold tracking-tight">{reservas.length}</p>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">{t('usage.total')} · {t('usage.unlimited')}</p>
      </div>
    )
  }

  const usados = countUsedSlots(reservas)
  const pct = Math.min(100, Math.round((usados / LIMITE_PLAN_PLUS) * 100))
  const mensaje =
    pct >= 100 ? t('usage.full')
      : pct >= 75 ? t('usage.almost')
        : t('usage.ok')

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <p className="eyebrow">{t('usage.title')} · {t('usage.plus')}</p>
        <span className="text-4xl font-bold tracking-tight">{pct}%</span>
      </div>
      {/* Barra segmentada: un bloque por cupo, más fácil de leer que una barra continua */}
      <div className="mt-4 grid grid-cols-4 gap-1.5" role="meter" aria-valuemin={0} aria-valuemax={LIMITE_PLAN_PLUS} aria-valuenow={usados} aria-label={t('usage.meter')}>
        {Array.from({ length: LIMITE_PLAN_PLUS }, (_, i) => (
          <div key={i} className={`h-3 rounded-full ${i < usados ? (pct >= 100 ? 'bg-brand-naranja' : 'bg-ink dark:bg-paper') : 'bg-line dark:bg-night-line'}`} />
        ))}
      </div>
      <p className="mt-3 text-sm font-medium">{t('usage.used', { used: Math.min(usados, LIMITE_PLAN_PLUS), max: LIMITE_PLAN_PLUS })}</p>
      <p className="text-xs text-ink-muted dark:text-slate-400">{mensaje}</p>
    </div>
  )
}
