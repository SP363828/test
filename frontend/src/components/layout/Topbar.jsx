import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ChevronDown, LogOut } from 'lucide-react'
import { cerrarSesion } from '../../features/auth/authSlice'
import { NAV_ITEMS } from './navItems'
import { Logo } from './Sidebar'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageToggle from '../ui/LanguageToggle'

export default function Topbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const usuario = useSelector((state) => state.auth.usuario)

  // Título de la pantalla actual a partir de la ruta (useLocation).
  const actual = NAV_ITEMS.find((item) => pathname.startsWith(item.to))

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur dark:border-night-line dark:bg-night-card/90">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link to="/dashboard" className="md:hidden"><Logo /></Link>
        <div className="hidden md:block">
          <p className="eyebrow">ReservaYa / {actual ? t(`nav.${actual.key}`) : ''}</p>
        </div>
        <UserMenu usuario={usuario} />
      </div>
    </header>
  )
}

// Menú desplegable del usuario: preferencias y cierre de sesión.
function UserMenu({ usuario }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  const esAdmin = usuario?.rol === 'admin'

  // Cierra el menú al hacer click afuera.
  useEffect(() => {
    const cerrar = (e) => ref.current && !ref.current.contains(e.target) && setAbierto(false)
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  // Logout: se limpia el store (todos los slices escuchan cerrarSesion) y se va al login.
  const handleLogout = () => {
    dispatch(cerrarSesion())
    toast.success(t('nav.logoutOk'))
    navigate('/login')
  }

  const iniciales = (usuario?.username || '?').slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((a) => !a)}
        className="flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 hover:bg-paper-alt dark:border-night-line dark:hover:bg-night-line"
        aria-expanded={abierto}
        aria-haspopup="menu"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-lima font-mono text-xs font-medium text-ink">{iniciales}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold">{usuario?.username}</span>
          <span className="block font-mono text-[10px] tracking-wider text-ink-muted uppercase dark:text-slate-400">
            {esAdmin ? t('nav.administrador') : t('nav.planDe', { plan: usuario?.plan })}
          </span>
        </span>
        <ChevronDown size={16} className={`transition ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div role="menu" className="absolute right-0 mt-2 w-60 rounded-xl border border-line bg-paper p-2 shadow-lg dark:border-night-line dark:bg-night-card">
          <div className="flex items-center justify-between px-3 py-2 text-sm">
            <span>{t('nav.language')}</span><LanguageToggle />
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-sm">
            <span>{t('nav.theme')}</span><ThemeToggle />
          </div>
          <hr className="my-1 border-line dark:border-night-line" />
          <button role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-paper-alt dark:hover:bg-night-line">
            <LogOut size={16} /> {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
