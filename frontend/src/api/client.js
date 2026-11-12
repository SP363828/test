// Cliente HTTP centralizado: usa la instancia de axios, agrega el token y normaliza errores.
import axiosConfig from '../utils/axiosConfig'
import i18n from '../i18n'

let onUnauthorized = () => {}
export const setOnUnauthorized = (fn) => { onUnauthorized = fn }

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function request(path, { method = 'GET', body, query, auth = true } = {}) {
  // Se descartan los parámetros vacíos para no mandar ?x=&y=
  const params = {}
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params[k] = v
    })
  }

  const headers = {}
  const token = localStorage.getItem('token')
  if (auth && token) headers.Authorization = `Bearer ${token}`

  // Con FormData (subida de imágenes) hay que pisar el Content-Type JSON por defecto
  if (body instanceof FormData) headers['Content-Type'] = 'multipart/form-data'

  try {
    const response = await axiosConfig.request({ url: path, method, data: body, params, headers })
    if (response.status === 204) return null
    return response.data
  } catch (error) {
    if (error.response) {
      const { status, data = {} } = error.response
      if (status === 401 && auth) onUnauthorized()
      throw new ApiError(data?.message || data?.error || i18n.t('errors.unexpected'), status)
    }
    // Sin respuesta: error de red o timeout
    throw new ApiError(i18n.t('errors.network'), 0)
  }
}
