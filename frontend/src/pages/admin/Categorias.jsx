import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Field from '../../components/ui/Field'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import BotonTraducir from '../../components/ui/BotonTraducir'
import { useTraduccion } from '../../utils/useTraduccion'
import { Pencil, Trash2, Tags } from 'lucide-react'
import { categoriaSchema } from '../../validation/schemas'
import { createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../../api/categories'
import { agregarCategoria, modificarCategoria, eliminarCategoria } from '../../features/categorias/categoriasSlice'

const VACIO = { name: '', description: '' }
// Cada categoría toma un color de la paleta, en orden.
const COLORES = ['bg-brand-lima', 'bg-brand-celeste', 'bg-brand-rosa', 'bg-brand-amarillo', 'bg-brand-lavanda', 'bg-brand-menta', 'bg-brand-naranja', 'bg-brand-azul']

// ABM de categorías (solo admin).
export default function Categorias() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const categorias = useSelector((state) => state.categorias.todas)
  const recursos = useSelector((state) => state.recursos.todos)
  const [editandoId, setEditandoId] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: yupResolver(categoriaSchema),
    mode: 'onChange',
    defaultValues: VACIO,
  })

  const onSubmit = async (data) => {
    try {
      if (editandoId) {
        dispatch(modificarCategoria(await updateCategoryApi(editandoId, data)))
        toast.success(t('categorias.updated'))
      } else {
        dispatch(agregarCategoria(await createCategoryApi(data)))
        toast.success(t('categorias.created'))
      }
      cancelarEdicion()
    } catch (error) {
      toast.error(error.message) // ej: 409 nombre duplicado
    }
  }

  const editar = (c) => {
    setEditandoId(c._id)
    reset({ name: c.name, description: c.description || '' })
  }
  const cancelarEdicion = () => {
    setEditandoId(null)
    reset(VACIO)
  }

  // El backend responde 409 si la categoría tiene recursos; en el front además se deshabilita el botón.
  const confirmarEliminar = async () => {
    try {
      await deleteCategoryApi(aEliminar._id)
      dispatch(eliminarCategoria(aEliminar._id))
      toast.success(t('categorias.deleted'))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAEliminar(null)
    }
  }

  const cantidadRecursos = (id) => recursos.filter((r) => r.category === id).length

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('categorias.eyebrow')}
        title={t('categorias.title')}
        description={t('categorias.desc')}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="card h-fit space-y-4" noValidate>
          <h2 className="font-semibold">{editandoId ? t('categorias.edit') : t('categorias.new')}</h2>
          <Field label={t('recursos.name')} error={errors.name}>
            <input className="input" {...register('name')} />
          </Field>
          <Field label={t('recursos.description')} error={errors.description}>
            <textarea rows={3} className="input" {...register('description')} />
          </Field>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={!isValid || isSubmitting}>{editandoId ? t('common.save') : t('common.create')}</button>
            {editandoId && <button type="button" className="btn-secondary" onClick={cancelarEdicion}>{t('common.cancel')}</button>}
          </div>
        </form>

        <div className="card lg:col-span-2">
          {categorias.length === 0 ? (
            <EmptyState icon={Tags} title={t('categorias.emptyTitle')} description={t('categorias.emptyDesc')} color="bg-brand-amarillo" />
          ) : (
            <ul className="divide-y divide-line dark:divide-night-line">
              {categorias.map((c, i) => (
                <CategoriaItem
                  key={c._id}
                  categoria={c}
                  color={COLORES[i % COLORES.length]}
                  cantidad={cantidadRecursos(c._id)}
                  onEditar={editar}
                  onEliminar={setAEliminar}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!aEliminar}
        title={t('categorias.deleteTitle')}
        message={t('categorias.deleteMsg', { name: aEliminar?.name })}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  )
}

// Fila de la lista. Es un componente aparte para que cada categoría tenga su propia traducción.
function CategoriaItem({ categoria, color, cantidad, onEditar, onEliminar }) {
  const { t } = useTranslation()
  const traduccion = useTraduccion([categoria.name, categoria.description])

  return (
    <li className="flex items-center gap-3 py-3">
      <span className={`h-10 w-1.5 shrink-0 rounded-full ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{traduccion.traducir(categoria.name)}</p>
        <p className="truncate text-xs text-ink-muted dark:text-slate-400">
          {categoria.description ? traduccion.traducir(categoria.description) : t('categorias.noDescription')}
        </p>
        <BotonTraducir traduccion={traduccion} className="mt-1" />
      </div>
      <span className="badge bg-paper-alt text-ink-soft dark:bg-night dark:text-slate-300">{t('categorias.count', { count: cantidad })}</span>
      <button className="btn-secondary btn-sm" onClick={() => onEditar(categoria)}><Pencil size={14} /> {t('common.edit')}</button>
      <button
        className="btn-danger btn-sm btn-icon"
        onClick={() => onEliminar(categoria)}
        disabled={cantidad > 0}
        title={cantidad > 0 ? t('categorias.cantDelete') : t('common.delete')}
        aria-label={t('recursos.deleteAria', { name: categoria.name })}
      >
        <Trash2 size={14} />
      </button>
    </li>
  )
}
