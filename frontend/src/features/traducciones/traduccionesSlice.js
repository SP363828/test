import { createSlice } from '@reduxjs/toolkit'

// Caché de traducciones de contenido dinámico: { 'Proyector portátil': 'Portable projector' }.
// Evita volver a pedir a la API un texto que ya se tradujo.
const initialState = {
  porTexto: {},
}

export const traduccionesSlice = createSlice({
  name: 'traducciones',
  initialState,
  reducers: {
    guardarTraduccion: (state, action) => {
      state.porTexto[action.payload.texto] = action.payload.traduccion
    },
  },
})

export const { guardarTraduccion } = traduccionesSlice.actions
export default traduccionesSlice.reducer
