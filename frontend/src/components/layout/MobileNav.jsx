import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { visibleItems } from './navItems'

// Barra de navegación inferior para celulares.
export default function MobileNav() {
  const { t } = useTranslation()
  const esAdmin = useSelector((state) => state.auth.usuario?.rol === 'admin')

  return (
    <nav aria-label={t('nav.principal')} className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-night-line dark:bg-night-card/95">
      {visibleItems(esAdmin).map(({ to, key, icon: Icon, color }) => (
        <NavLink key={to} to={to} className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium">
          {({ isActive }) => (
            <>
              <span className={`rounded-full px-4 py-1 transition ${isActive ? `${color} text-ink` : 'text-ink-muted dark:text-slate-400'}`}>
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span className={isActive ? 'font-semibold' : 'text-ink-muted dark:text-slate-400'}>{t(`nav.${key}`)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
