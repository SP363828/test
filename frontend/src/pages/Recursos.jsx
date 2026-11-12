import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import RecursoCard from '../components/recursos/RecursoCard'
import RecursoForm from '../components/recursos/RecursoForm'
import Pagination from '../components/ui/Pagination'
import Skeleton from '../components/ui/Skeleton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { Plus, Search, SearchX, Boxes } from 'lucide-react'
import { getResourcesApi, deleteResourceApi } from '../api/resources'
import { eliminarRecurso } from '../features/recursos/recursosSlice'
import { useDebounce } from '../utils/useDebounce'
import { mostrarSpinner, ocultarSpinner } from '../features/spinner/spinnerSlice'
import { ESTADOS_RECURSO } from '../utils/constants'

// Catálogo de recursos: todos pueden verlo; el admin además crea, edita y elimina.
// La página filtrada es estado local porque solo se usa acá; el catálogo completo está en Redux.
export default function Recursos() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const usuario = useSelector((state) => state.auth.usuario)
  const categorias = useSelector((state) => state.categorias.todas)
  const esAdmin = usuario?.rol === 'admin'

  const [filtros, setFiltros] = useState({ name: '', category: '', status: '', page: 1, limit: 6 })
  const [pagina, setPagina] = useState({ data: [], meta: null })
  const cargando = useSelector((state) => state.spinner.cargando)
  const [recarga, setRecarga] = useState(0)
  const [editando, setEditando] = useState(undefined) // undefined: cerrado · null: alta · objeto: edición
  const [aEliminar, setAEliminar] = useState(null)

  // Debounce: espera a que el usuario deje de escribir para no hacer un request por tecla.
  const nombre = useDebounce(filtros.name, 400)
  const { category, status, page, limit } = filtros

  useEffect(() => {
    const cargar = async () => {
      dispatch(mostrarSpinner())
      try {
        setPagina(await getResourcesApi({ name: nombre, category, status, page, limit }))
      } catch (error) {
        toast.error(error.message)
      } finally {
        dispatch(ocultarSpinner())
      }
    }
    cargar()
  }, [dispatch, nombre, category, status, page, limit, recarga])

  const cambiar = (cambios) => setFiltros((f) => ({ ...f, page: 1, ...cambios }))
  const recargar = () => setRecarga((n) => n + 1)

  const confirmarEliminar = async () => {
    try {
      await deleteResourceApi(aEliminar._id)
      dispatch(eliminarRecurso(aEliminar._id))
      toast.success(t('recursos.deleted'))
      recargar()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAEliminar(null)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('recursos.eyebrow')}
        title={t('recursos.title')}
        description={t('recursos.desc')}
      >
        {esAdmin && <button className="btn-primary" onClick={() => setEditando(null)}><Plus size={16} /> {t('recursos.new')}</button>}
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder={t('recursos.search')} aria-label={t('recursos.search')} value={filtros.name} onChange={(e) => cambiar({ name: e.target.value })} />
        </div>
        <select className="input w-auto" value={category} onChange={(e) => cambiar({ category: e.target.value })}>
          <option value="">{t('recursos.allCategories')}</option>
          {categorias.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="input w-auto" value={status} onChange={(e) => cambiar({ status: e.target.value })}>
          <option value="">{t('filtros.allStatus')}</option>
          {ESTADOS_RECURSO.map((s) => <option key={s} value={s}>{t(`estadoRecurso.${s}`)}</option>)}
        </select>
      </div>

      {cargando && pagina.data.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      ) : pagina.data.length === 0 ? (
        <div className="card">
          {filtros.name || category || status ? (
            <EmptyState icon={SearchX} title={t('recursos.notFoundTitle')} description={t('recursos.notFoundDesc')} color="bg-brand-amarillo">
              <button className="btn-secondary btn-sm" onClick={() => cambiar({ name: '', category: '', status: '' })}>{t('recursos.clearFilters')}</button>
            </EmptyState>
          ) : (
            <EmptyState icon={Boxes} title={t('recursos.emptyTitle')} description={esAdmin ? t('recursos.emptyAdmin') : t('recursos.emptyUser')} color="bg-brand-celeste">
              {esAdmin && <button className="btn-primary btn-sm" onClick={() => setEditando(null)}><Plus size={14} /> {t('recursos.new')}</button>}
            </EmptyState>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pagina.data.map((r) => (
            <RecursoCard key={r._id} recurso={r} isAdmin={esAdmin} onEdit={setEditando} onDelete={setAEliminar} />
          ))}
        </div>
      )}

      <Pagination meta={pagina.meta} onChange={(p) => cambiar({ page: p })} />

      {editando !== undefined && (
        <RecursoForm recurso={editando} onClose={() => setEditando(undefined)} onGuardado={recargar} />
      )}
      <ConfirmDialog
        open={!!aEliminar}
        title={t('recursos.deleteTitle')}
        message={t('recursos.deleteMsg', { name: aEliminar?.name })}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  )
}
