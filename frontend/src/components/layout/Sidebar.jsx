import { NavLink, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { visibleItems } from './navItems'
import { countUsedSlots, LIMITE_PLAN_PLUS } from '../../utils/constants'

export default function Sidebar() {
  const { t } = useTranslation()
  const usuario = useSelector((state) => state.auth.usuario)
  const esAdmin = usuario?.rol === 'admin'

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper p-4 md:flex dark:border-night-line dark:bg-night-card">
      <Link to="/dashboard" className="px-2 py-1"><Logo /></Link>

      <nav className="mt-8 flex-1 space-y-1" aria-label={t('nav.principal')}>
        {visibleItems(esAdmin).map(({ to, key, icon: Icon, color, admin }) => (
          <div key={to}>
            {admin && <p className="eyebrow px-3 pt-5 pb-2">{t('nav.admin')}</p>}
            <NavLink
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  isActive ? `${color} text-ink` : 'text-ink-soft hover:bg-paper-alt dark:text-slate-300 dark:hover:bg-night-line'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">{t(`nav.${key}`)}</span>
                <span className="text-xs opacity-70">{t(`nav.${key}Desc`)}</span>
              </span>
            </NavLink>
          </div>
        ))}
      </nav>

      {!esAdmin && <PlanResumen usuario={usuario} />}
    </aside>
  )
}

// Mini resumen del plan siempre visible: ayuda a entender el límite de cupos.
function PlanResumen({ usuario }) {
  const { t } = useTranslation()
  const reservas = useSelector((state) => state.reservas.todas)
  if (usuario?.plan === 'premium') {
    return (
      <div className="rounded-xl bg-brand-lavanda p-4 text-ink">
        <p className="eyebrow text-ink/70">{t('usage.plan')}</p>
        <p className="flex items-center gap-1 font-semibold"><Sparkles size={16} /> Premium</p>
        <p className="text-xs text-ink/70">{t('usage.unlimited')}</p>
      </div>
    )
  }
  const usados = Math.min(countUsedSlots(reservas), LIMITE_PLAN_PLUS)
  return (
    <div className="rounded-xl bg-paper-alt p-4 dark:bg-night">
      <p className="eyebrow">{t('usage.plus')}</p>
      <p className="mt-1 text-sm font-semibold">{t('usage.slots', { used: usados, max: LIMITE_PLAN_PLUS })}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line dark:bg-night-line">
        <div className="h-full rounded-full bg-ink dark:bg-paper" style={{ width: `${(usados / LIMITE_PLAN_PLUS) * 100}%` }} />
      </div>
      <Link to="/dashboard#plan" className="mt-3 inline-block text-xs font-semibold underline underline-offset-4">{t('usage.goPremium')}</Link>
    </div>
  )
}

export function Logo({ invert = false }) {
  return (
    <span className={`flex items-baseline gap-1 text-xl font-black tracking-tight ${invert ? 'text-paper' : 'text-ink dark:text-paper'}`}>
      Reserva<span className="rounded-md bg-brand-naranja px-1.5 text-ink">Ya</span>
    </span>
  )
}
