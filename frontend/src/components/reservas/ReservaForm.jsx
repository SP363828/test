import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'
import Field from '../ui/Field'
import ChipSelect from '../ui/ChipSelect'
import Spinner from '../ui/Spinner'
import ReservaResumen from './ReservaResumen'
import { nuevaReservaSchema, reservaToApi } from '../../validation/schemas'
import { createReservationApi } from '../../api/reservations'
import { agregarReserva, cambiarFiltros } from '../../features/reservas/reservasSlice'
import { BLOQUES, RECURRENCIAS, LIMITE_PLAN_PLUS, combinacionesActivas, hoyLocal } from '../../utils/constants'

// Función (no constante) para que la fecha de hoy se recalcule en cada reset.
const valoresIniciales = () => ({ resources: [], bloques: [], fechaInicio: hoyLocal(), fechaFin: '', tipoRecurrencia: 'unica' })

// Bloques agrupados por franja: más fácil de recorrer que 32 botones seguidos.
const FRANJAS = [
  { nombre: 'reservas.morning', bloques: BLOQUES.filter((b) => b < '12:00') },
  { nombre: 'reservas.afternoon', bloques: BLOQUES.filter((b) => b >= '12:00' && b < '19:00') },
  { nombre: 'reservas.night', bloques: BLOQUES.filter((b) => b >= '19:00') },
]

// Encabezado numerado de cada paso del formulario.
function Paso({ numero, titulo, children }) {
  return (
    <section className="grid gap-4 border-t border-line pt-5 first:border-0 first:pt-0 md:grid-cols-[180px_1fr] dark:border-night-line">
      <div className="flex items-center gap-3 md:items-start">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-mono text-sm text-paper dark:bg-paper dark:text-ink">{numero}</span>
        <p className="font-semibold md:pt-1">{titulo}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

// Alta de reserva en 3 pasos (un único useForm). Se bloquea si el usuario plus ya usó todos sus cupos.
export default function ReservaForm({ recursoPreseleccionado }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const usuario = useSelector((state) => state.auth.usuario)
  const recursos = useSelector((state) => state.recursos.todos)
  const reservas = useSelector((state) => state.reservas.todas)

  const esPlus = usuario?.plan === 'plus' && usuario?.rol !== 'admin'
  const usadas = combinacionesActivas(reservas)
  const cuposLibres = esPlus ? LIMITE_PLAN_PLUS - usadas.size : Infinity

  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(nuevaReservaSchema),
    defaultValues: valoresIniciales(),
  })

  // Si se llega desde el recomendador de IA o desde un recurso, se precarga.
  useEffect(() => {
    if (recursoPreseleccionado) setValue('resources', [recursoPreseleccionado])
  }, [recursoPreseleccionado, setValue])

  // watch(): para mostrar/ocultar campos, calcular cupos y armar el resumen en vivo.
  const valores = watch()
  // Como en el backend, solo consumen cupo las combinaciones recurso+horario que el usuario todavía no tiene.
  const cuposNuevos = valores.resources
    .flatMap((recurso) => valores.bloques.map((bloque) => `${recurso}-${bloque}`))
    .filter((combinacion) => !usadas.has(combinacion)).length
  const excedeLimite = esPlus && cuposNuevos > cuposLibres

  const onSubmit = async (data) => {
    try {
      const nueva = await createReservationApi(reservaToApi(data))
      dispatch(agregarReserva(nueva))
      dispatch(cambiarFiltros({})) // recarga el listado en la página 1
      toast.success(t('reservas.created'))
      reset(valoresIniciales())
    } catch (error) {
      // 409: sin disponibilidad o límite del plan (lo valida el backend)
      toast.error(error.message)
    }
  }

  const opcionesRecursos = recursos.map((r) => ({
    value: r._id,
    label: `${r.name} · ${t('recursos.units', { count: r.stock })}`,
    disabled: r.status !== 'available',
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 md:p-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">{t('reservas.new')}</h2>
        {esPlus && <span className="badge bg-brand-lima text-ink">{t('reservas.freeSlots', { free: cuposLibres, max: LIMITE_PLAN_PLUS })}</span>}
      </div>

      {/* Con el plan lleno el formulario sigue visible: se pueden repetir combinaciones que ya se tienen */}
      {esPlus && cuposLibres <= 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-naranja/15 p-4">
          <Lock size={20} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t('reservas.limitTitle')}</p>
            <p className="text-sm text-ink-soft dark:text-slate-300">{t('reservas.limitDesc', { max: LIMITE_PLAN_PLUS })}</p>
          </div>
          <Link to="/dashboard#plan" className="btn-accent btn-sm">{t('reservas.seePremium')}</Link>
        </div>
      )}

      <Paso numero="1" titulo={t('reservas.step1')}>
        {/* Controller: para inputs personalizados que no son un <input> nativo */}
        <Field error={errors.resources}>
          <Controller name="resources" control={control} render={({ field }) => (
            <ChipSelect options={opcionesRecursos} value={field.value} onChange={field.onChange} />
          )} />
          {recursos.length === 0 && <p className="text-sm text-ink-muted">{t('reservas.noResources')}</p>}
        </Field>
      </Paso>

      <Paso numero="2" titulo={t('reservas.step2')}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t('reservas.repeat')} error={errors.tipoRecurrencia}>
            <select className="input" {...register('tipoRecurrencia')}>
              {RECURRENCIAS.map((r) => <option key={r} value={r}>{t(`recurrencia.${r}`)}</option>)}
            </select>
          </Field>
          <Field label={valores.tipoRecurrencia === 'unica' ? t('reservas.date') : t('reservas.from')} error={errors.fechaInicio}>
            <input type="date" min={hoyLocal()} className="input" {...register('fechaInicio')} />
          </Field>
          {/* La fecha de fin solo aparece si la reserva se repite (ver yup.when en el esquema) */}
          {valores.tipoRecurrencia !== 'unica' && (
            <Field label={t('reservas.to')} error={errors.fechaFin}>
              <input type="date" min={valores.fechaInicio} className="input" {...register('fechaFin')} />
            </Field>
          )}
        </div>
        <Field label={t('reservas.blocks')} error={errors.bloques}>
          <Controller name="bloques" control={control} render={({ field }) => (
            <div className="space-y-3">
              {FRANJAS.map(({ nombre, bloques }) => (
                <div key={nombre} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                  <span className="eyebrow w-16 shrink-0 pt-1.5">{t(nombre)}</span>
                  <ChipSelect options={bloques.map((b) => ({ value: b, label: b }))} value={field.value} onChange={field.onChange} />
                </div>
              ))}
            </div>
          )} />
        </Field>
      </Paso>

      <Paso numero="3" titulo={t('reservas.step3')}>
        <ReservaResumen valores={valores} cuposNuevos={cuposNuevos} esPlus={esPlus} />
        {excedeLimite && (
          <p className="rounded-xl bg-brand-naranja/15 p-3 text-sm font-medium">
            {t('reservas.exceeds', { count: cuposNuevos, libres: cuposLibres })}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => reset(valoresIniciales())}>{t('common.clear')}</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting || excedeLimite}>
            {isSubmitting && <Spinner />} {t('reservas.confirm')}
          </button>
        </div>
      </Paso>
    </form>
  )
}
