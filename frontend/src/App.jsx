import { useTranslation } from 'react-i18next'
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import PublicRoute from './routes/PublicRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// Code splitting: las pantallas privadas se descargan recién cuando se visitan.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Reservas = lazy(() => import('./pages/Reservas'))
const Recursos = lazy(() => import('./pages/Recursos'))
const Categorias = lazy(() => import('./pages/admin/Categorias'))

function Cargando() {
  const { t } = useTranslation()
  return <div className="py-20 text-center text-sm text-slate-500">{t('common.loading')}</div>
}

export default function App() {
  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        {/* Rutas públicas: si ya hay sesión redirigen al dashboard */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rutas protegidas: requieren estar logueado */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/recursos" element={<Recursos />} />
            {/* Rutas de administrador */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/categorias" element={<Categorias />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
