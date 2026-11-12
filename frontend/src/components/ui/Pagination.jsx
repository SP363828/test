import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Devuelve las páginas a mostrar: primera, última y vecinas de la actual, con "…" en los saltos.
function paginasVisibles(actual, total) {
  const paginas = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - actual) <= 1) paginas.push(p)
    else if (paginas[paginas.length - 1] !== '…') paginas.push('…')
  }
  return paginas
}

// onLimitChange es opcional: si viene, se muestra el selector de cantidad por página.
export default function Pagination({ meta, onChange, onLimitChange, opciones = [5, 10, 20] }) {
  const { t } = useTranslation()
  if (!meta || (meta.totalPages <= 1 && !(onLimitChange && meta.total > opciones[0]))) return null
  const { page, totalPages, total, limit } = meta

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm dark:border-night-line">
      <div className="flex items-center gap-3">
        <span className="eyebrow">{t('pagination.results', { count: total })}</span>
        {onLimitChange && (
          <select className="input w-auto py-1 text-xs" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} aria-label={t('pagination.perPageLabel')}>
            {opciones.map((n) => <option key={n} value={n}>{t('pagination.perPage', { n })}</option>)}
          </select>
        )}
      </div>
      <nav className="flex items-center gap-1" aria-label={t('pagination.label')}>
        <button className="btn-secondary btn-sm btn-icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label={t('pagination.prev')}>
          <ChevronLeft size={16} />
        </button>
        {paginasVisibles(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`salto-${i}`} className="px-1 text-ink-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`h-8 min-w-8 rounded-full px-2 font-mono text-xs ${p === page ? 'bg-ink text-paper dark:bg-paper dark:text-ink' : 'hover:bg-paper-alt dark:hover:bg-night-line'}`}
            >
              {p}
            </button>
          ),
        )}
        <button className="btn-secondary btn-sm btn-icon" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label={t('pagination.next')}>
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  )
}
