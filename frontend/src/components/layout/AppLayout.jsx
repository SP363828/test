import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'
import toast from 'react-hot-toast'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import SpinnerGlobal from '../ui/SpinnerGlobal'
import { getResourcesApi } from '../../api/resources'
import { getCategoriesApi } from '../../api/categories'
import { getAllReservationsApi } from '../../api/reservations'
import { guardarRecursos } from '../../features/recursos/recursosSlice'
import { guardarCategorias } from '../../features/categorias/categoriasSlice'
import { guardarTodas } from '../../features/reservas/reservasSlice'
import { mostrarSpinner, ocultarSpinner } from '../../features/spinner/spinnerSlice'

// Layout de la parte privada. Al entrar carga en el store los datos que
// comparten varias pantallas (recursos, categorías y reservas del usuario).
export default function AppLayout() {
  const dispatch = useDispatch()

  useEffect(() => {
    const cargarDatos = async () => {
      dispatch(mostrarSpinner())
      try {
        const [recursos, categorias, reservas] = await Promise.all([
          getResourcesApi({ limit: 50 }),
          getCategoriesApi({ limit: 50 }),
          getAllReservationsApi(),
        ])
        dispatch(guardarRecursos(recursos.data))
        dispatch(guardarCategorias(categorias.data))
        dispatch(guardarTodas(reservas))
      } catch (error) {
        toast.error(error.message)
      } finally {
        dispatch(ocultarSpinner())
      }
    }
    cargarDatos()
  }, [dispatch])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {/* pb-24 en móvil para que la barra inferior no tape el contenido */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-24 md:p-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <SpinnerGlobal />
    </div>
  )
}
