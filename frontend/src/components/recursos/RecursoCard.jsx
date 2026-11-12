import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Package, Pencil, Trash2, CalendarPlus } from 'lucide-react'
import BotonTraducir from '../ui/BotonTraducir'
import { useTraduccion } from '../../utils/useTraduccion'

// Estado con color + texto. Las tarjetas sin imagen toman un color según su estado.
const ESTADO = {
  available: { cls: 'bg-brand-menta text-ink', fondo: 'bg-brand-celeste' },
  maintenance: { cls: 'bg-brand-amarillo text-ink', fondo: 'bg-brand-amarillo/60' },
  inactive: { cls: 'bg-line text-ink-soft', fondo: 'bg-line' },
}

export default function RecursoCard({ recurso, isAdmin, onEdit, onDelete }) {
  const { t } = useTranslation()
  const categorias = useSelector((state) => state.categorias.todas)
  const categoria = categorias.find((c) => c._id === recurso.category)?.name
  const estado = ESTADO[recurso.status]
  const traduccion = useTraduccion([recurso.name, recurso.description, categoria])

  return (
    <article className="card flex flex-col overflow-hidden p-0 transition hover:-translate-y-0.5">
      <div className={`relative aspect-[4/3] ${estado.fondo}`}>
        {recurso.imagenUrl
          ? <img src={recurso.imagenUrl} alt={recurso.name} className="h-full w-full object-cover" loading="lazy" />
          : <div className="grid h-full place-items-center text-ink/60"><Package size={48} strokeWidth={1.25} /></div>}
        <span className={`badge absolute top-3 left-3 ${estado.cls}`}>{t(`estadoRecurso.${recurso.status}`)}</span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow">{categoria ? traduccion.traducir(categoria) : t('recursos.noCategory')}</p>
        <h3 className="mt-1 text-lg font-semibold leading-tight">{traduccion.traducir(recurso.name)}</h3>
        <p className="mt-1 font-mono text-xs text-ink-muted dark:text-slate-400">{t('recursos.units', { count: recurso.stock })}</p>

        {recurso.description && (
          <p className="mt-3 text-sm text-ink-soft dark:text-slate-300">{traduccion.traducir(recurso.description)}</p>
        )}
        <BotonTraducir traduccion={traduccion} className="mt-2 self-start" />

        <div className="mt-auto flex gap-2 pt-4">
          {recurso.status === 'available' && (
            <Link to={`/reservas?recurso=${recurso._id}`} className="btn-primary btn-sm"><CalendarPlus size={14} /> {t('recursos.book')}</Link>
          )}
          {isAdmin && (
            <>
              <button className="btn-secondary btn-sm" onClick={() => onEdit(recurso)}><Pencil size={14} /> {t('common.edit')}</button>
              <button className="btn-danger btn-sm btn-icon" onClick={() => onDelete(recurso)} aria-label={t('recursos.deleteAria', { name: recurso.name })}><Trash2 size={14} /></button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
