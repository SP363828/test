import axios from 'axios'

// Instancia de axios con la URL base de la API.
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default instance
