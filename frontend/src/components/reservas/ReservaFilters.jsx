import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, X } from 'lucide-react'
import { cambiarFiltros, FILTROS_INICIALES } from '../../features/reservas/reservasSlice'
import { useDebounce } from '../../utils/useDebounce'
import { RECURRENCIAS, ESTADOS_RESERVA, formatDate } from '../../utils/constants'

const ORDENES = [
  { value: 'fechaInicio', label: 'filtros.sortNear' },
  { value: '-fechaInicio', label: 'filtros.sortFar' },
  { value: '-createdAt', label: 'filtros.sortNew' },
  { value: 'createdAt', label: 'filtros.sortOld' },
]

// Filtros del listado. Viven en Redux y el listado los envía como query params al backend.
export default function ReservaFilters() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const filtros = useSelector((state) => state.reservas.filtros)
  const recursos = useSelector((state) => state.recursos.todos)

  // El texto se guarda local y pasa a Redux con debounce: un request por búsqueda, no por tecla.
  const [texto, setTexto] = useState(filtros.q)
  const q = useDebounce(texto, 400)

  useEffect(() => {
    if (q !== filtros.q) dispatch(cambiarFiltros({ q }))
    // Solo debe reaccionar al texto escrito, no a cada cambio de filtros.
  }, [q, dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const cambiar = (campo) => (e) => dispatch(cambiarFiltros({ [campo]: e.target.value }))
  const quitar = (campo) => {
    if (campo === 'q') setTexto('')
    dispatch(cambiarFiltros({ [campo]: '' }))
  }
  const limpiar = () => {
    setTexto('')
    dispatch(cambiarFiltros({ ...FILTROS_INICIALES, limit: filtros.limit, sort: filtros.sort }))
  }

  // Chips: muestran qué filtros están aplicados y permiten quitarlos de a uno.
  const activos = [
    filtros.q && { campo: 'q', label: `"${filtros.q}"` },
    filtros.status && { campo: 'status', label: t(`estadosReserva.${filtros.status}`) },
    filtros.resource && { campo: 'resource', label: recursos.find((r) => r._id === filtros.resource)?.name || t('reservas.resource') },
    filtros.tipoRecurrencia && { campo: 'tipoRecurrencia', label: t(`recurrencia.${filtros.tipoRecurrencia}`) },
    filtros.desde && { campo: 'desde', label: t('filtros.fromDate', { fecha: formatDate(filtros.desde) }) },
    filtros.hasta && { campo: 'hasta', label: t('filtros.toDate', { fecha: formatDate(filtros.hasta) }) },
  ].filter(Boolean)

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder={t('filtros.search')} aria-label={t('filtros.search')} maxLength={100} value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <select className="input" aria-label={t('filtros.status')} value={filtros.status} onChange={cambiar('status')}>
          <option value="">{t('filtros.allStatus')}</option>
          {ESTADOS_RESERVA.map((e) => <option key={e} value={e}>{t(`estadosReserva.${e}`)}</option>)}
        </select>
        <select className="input" aria-label={t('filtros.order')} value={filtros.sort} onChange={cambiar('sort')}>
          {ORDENES.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
        </select>
        <select className="input" aria-label={t('filtros.resource')} value={filtros.resource} onChange={cambiar('resource')}>
          <option value="">{t('filtros.allResources')}</option>
          {recursos.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
        <select className="input" aria-label={t('filtros.repeat')} value={filtros.tipoRecurrencia} onChange={cambiar('tipoRecurrencia')}>
          <option value="">{t('filtros.allRepeat')}</option>
          {RECURRENCIAS.map((r) => <option key={r} value={r}>{t(`recurrencia.${r}`)}</option>)}
        </select>
        <input type="date" className="input" aria-label={t('filtros.from')} max={filtros.hasta || undefined} value={filtros.desde} onChange={cambiar('desde')} />
        <input type="date" className="input" aria-label={t('filtros.to')} min={filtros.desde || undefined} value={filtros.hasta} onChange={cambiar('hasta')} />
      </div>

      {activos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activos.map(({ campo, label }) => (
            <button key={campo} onClick={() => quitar(campo)} aria-label={t('filtros.remove', { label })} className="inline-flex items-center gap-1 rounded-full bg-brand-lima px-3 py-1 text-xs font-medium text-ink">
              {label} <X size={12} />
            </button>
          ))}
          <button className="text-xs font-semibold underline underline-offset-4" onClick={limpiar}>{t('filtros.clearAll')}</button>
        </div>
      )}
    </div>
  )
}
