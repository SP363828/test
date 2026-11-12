import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Modal from 'react-modal'
import { store } from './app/store'
import './i18n'
import './index.css'
import App from './App'
import { aplicarTema, temaGuardado } from './utils/theme'

aplicarTema(temaGuardado())

// react-modal oculta el resto de la app a los lectores de pantalla mientras hay un modal abierto.
Modal.setAppElement('#root')

// Toasts con los colores de la marca.
const toastOptions = {
  style: { background: '#000', color: '#fff', borderRadius: '999px', fontSize: '14px', padding: '10px 16px' },
  success: { iconTheme: { primary: '#def294', secondary: '#000' } },
  error: { iconTheme: { primary: '#fb6435', secondary: '#000' } },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-center" toastOptions={toastOptions} />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
