import { configureStore } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import i18n from '../i18n'
import authReducer, { cerrarSesion } from '../features/auth/authSlice'
import reservasReducer from '../features/reservas/reservasSlice'
import recursosReducer from '../features/recursos/recursosSlice'
import categoriasReducer from '../features/categorias/categoriasSlice'
import traduccionesReducer from '../features/traducciones/traduccionesSlice'
import spinnerReducer from '../features/spinner/spinnerSlice'
import { setOnUnauthorized } from '../api/client'

// El nombre de cada propiedad es la porción del state que maneja ese reducer.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    reservas: reservasReducer,
    recursos: recursosReducer,
    categorias: categoriasReducer,
    traducciones: traduccionesReducer,
    spinner: spinnerReducer,
  },
})

// Si la API responde 401 (token vencido o inválido) se cierra la sesión.
// El id evita toasts repetidos cuando fallan varios requests a la vez.
setOnUnauthorized(() => {
  store.dispatch(cerrarSesion())
  toast.error(i18n.t('errors.sessionExpired'), { id: 'sesion-expirada' })
})
