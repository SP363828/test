import Modal from 'react-modal'
import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'
import Spinner from './Spinner'

// Modal de confirmación para acciones destructivas.
// react-modal ya resuelve cerrar con Escape y con clic afuera (onRequestClose).
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={open}
      onRequestClose={onCancel}
      contentLabel={title}
      role="alertdialog"
      overlayClassName="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      className="card w-full max-w-sm outline-none"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-naranja text-ink"><TriangleAlert size={22} /></span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onCancel} autoFocus>{t('common.cancel')}</button>
        <button className="btn-accent" onClick={onConfirm} disabled={loading}>
          {loading && <Spinner />} {t('common.delete')}
        </button>
      </div>
    </Modal>
  )
}
