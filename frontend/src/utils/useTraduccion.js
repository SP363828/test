import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { translateApi } from '../api/extras'
import { guardarTraduccion } from '../features/traducciones/traduccionesSlice'

const LARGO_MAXIMO = 500 // el mismo límite que valida el backend

// Traducción a pedido (al inglés) de contenido dinámico: nombres y descripciones que vienen de la base.
// Los textos fijos de la interfaz no pasan por acá: usan i18next.
export function useTraduccion(textos) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const guardadas = useSelector((state) => state.traducciones.porTexto)
  const [pedida, setPedida] = useState(false)
  const [cargando, setCargando] = useState(false)

  const pendientes = textos.filter((texto) => texto && texto.length <= LARGO_MAXIMO && !guardadas[texto])
  // Si un texto cambia (ej: se edita el recurso) se vuelve al original hasta pedirla de nuevo.
  const activa = pedida && pendientes.length === 0

  const alternar = async () => {
    if (activa) return setPedida(false)
    setCargando(true)
    try {
      const respuestas = await Promise.all(pendientes.map((texto) => translateApi(texto)))
      // Si el servicio externo no está disponible, el backend responde translated: null.
      if (respuestas.some((r) => !r.translated)) throw new Error()
      respuestas.forEach((r, i) => dispatch(guardarTraduccion({ texto: pendientes[i], traduccion: r.translated })))
      setPedida(true)
    } catch {
      toast.error(t('traduccion.error'))
    } finally {
      setCargando(false)
    }
  }

  const traducir = (texto) => (activa && guardadas[texto]) || texto

  return { activa, cargando, alternar, traducir }
}
