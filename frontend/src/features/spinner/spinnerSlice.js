import { createSlice } from '@reduxjs/toolkit'

// Spinner global: cualquier pantalla lo muestra mientras carga datos de la API.
const initialState = { cargando: false }

export const spinnerSlice = createSlice({
  name: 'spinner',
  initialState,
  reducers: {
    mostrarSpinner: (state) => {
      state.cargando = true
    },
    ocultarSpinner: (state) => {
      state.cargando = false
    },
  },
})

export const { mostrarSpinner, ocultarSpinner } = spinnerSlice.actions
export default spinnerSlice.reducer
