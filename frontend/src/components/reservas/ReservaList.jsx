import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarPlus, SearchX } from 'lucide-react'
import ReservaItem from './ReservaItem'
import ReservaFilters from './ReservaFilters'
import Pagination from '../ui/Pagination'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import ConfirmDialog from '../ui/ConfirmDialog'
import { getReservationsApi, deleteReservationApi } from '../../api/reservations'
import { guardarListado, eliminarReserva, cambiarFiltros, FILTROS_INICIALES } from '../../features/reservas/reservasSlice'
import { mostrarSpinner, ocultarSpinner } from '../../features/spinner/spinnerSlice'

const CAMPOS_NUMERICOS = ['page', 'limit']

// Lee los filtros de la URL (?status=active&page=2) para poder compartirla o recargar.
function filtrosDesdeUrl(params) {
  const filtros = {}
  Object.keys(FILTROS_INICIALES).forEach((campo) => {
    const valor = params.get(campo)
    if (valor === null) return
    if (!CAMPOS_NUMERICOS.includes(campo)) filtros[campo] = valor
    else if (Number(valor) >= 1) filtros[campo] = Number(valor)
  })
  return filtros
}

// Las fechas del filtro cubren el día completo.
const filtrosParaApi = (filtros) => ({
  ...filtros,
  desde: filtros.desde && `${filtros.desde}T00:00:00.000Z`,
  hasta: filtros.hasta && `${filtros.hasta}T23:59:59.999Z`,
})

export default function ReservaList() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { listado, meta, filtros } = useSelector((state) => state.reservas)
  const [params, setParams] = useSearchParams()
  const [listo, setListo] = useState(false)
  const cargando = useSelector((state) => state.spinner.cargando)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Al entrar, la URL manda sobre los filtros guardados.
  useEffect(() => {
    const desdeUrl = filtrosDesdeUrl(params)
    if (Object.keys(desdeUrl).length > 0) dispatch(cambiarFiltros(desdeUrl))
    setListo(true)
    // Solo al montar: después es Redux el que actualiza la URL.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cada vez que cambian los filtros (o la página) se consulta la API y se actualiza la URL.
  useEffect(() => {
    if (!listo) return
    let vigente = true // descarta respuestas viejas si el usuario cambió de filtro mientras tanto

    setParams((actuales) => {
      const nuevos = new URLSearchParams(actuales)
      Object.entries(filtros).forEach(([campo, valor]) => {
        if (valor === FILTROS_INICIALES[campo] || valor === '') nuevos.delete(campo)
        else nuevos.set(campo, valor)
      })
      return nuevos
    }, { replace: true })

    const cargar = async () => {
      dispatch(mostrarSpinner())
      try {
        const respuesta = await getReservationsApi(filtrosParaApi(filtros))
        if (vigente) dispatch(guardarListado(respuesta))
      } catch (error) {
        if (vigente) toast.error(error.message)
      } finally {
        dispatch(ocultarSpinner())
      }
    }
    cargar()
    return () => { vigente = false }
  }, [dispatch, filtros, listo, setParams])

  const confirmarEliminar = async () => {
    setEliminando(true)
    try {
      await deleteReservationApi(aEliminar._id)
      dispatch(eliminarReserva(aEliminar._id))
      toast.success(t('reservas.deleted'))
      // Si era la última de la página, se vuelve a la anterior; si no, se recarga la misma.
      const pagina = listado.length === 1 && filtros.page > 1 ? filtros.page - 1 : filtros.page
      dispatch(cambiarFiltros({ page: pagina }))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  const hayFiltros = ['q', 'status', 'resource', 'tipoRecurrencia', 'desde', 'hasta'].some((campo) => filtros[campo])

  return (
    <div className="card">
      <h2 className="mb-4 text-xl font-bold tracking-tight">{t('reservas.title')}</h2>
      <ReservaFilters />

      {cargando && listado.length === 0 ? (
        <div className="space-y-3 pt-4"><Skeleton /><Skeleton /><Skeleton /></div>
      ) : listado.length === 0 ? (
        hayFiltros ? (
          <EmptyState icon={SearchX} title={t('reservas.noResultsTitle')} description={t('reservas.noResultsDesc')} color="bg-brand-amarillo" />
        ) : (
          <EmptyState icon={CalendarPlus} title={t('reservas.empty')} description={t('reservas.emptyDesc')} color="bg-brand-lima">
            <button className="btn-primary btn-sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('reservas.goForm')}</button>
          </EmptyState>
        )
      ) : (
        <ul className={`mt-2 divide-y divide-line transition-opacity dark:divide-night-line ${cargando ? 'opacity-50' : ''}`}>
          {listado.map((r) => <ReservaItem key={r._id} reserva={r} onEliminar={setAEliminar} />)}
        </ul>
      )}

      <Pagination
        meta={meta}
        onChange={(page) => dispatch(cambiarFiltros({ page }))}
        onLimitChange={(limit) => dispatch(cambiarFiltros({ limit }))}
      />

      <ConfirmDialog
        open={!!aEliminar}
        title={t('reservas.deleteTitle')}
        message={t('reservas.deleteMsg')}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
        loading={eliminando}
      />
    </div>
  )
}
