import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Modal from 'react-modal'
import Field from '../ui/Field'
import ImageUpload from './ImageUpload'
import { recursoSchema } from '../../validation/schemas'
import { createResourceApi, updateResourceApi } from '../../api/resources'
import { agregarRecurso, modificarRecurso } from '../../features/recursos/recursosSlice'
import { ESTADOS_RECURSO } from '../../utils/constants'

// Modal de alta/edición de recurso (admin). recurso = null → alta.
export default function RecursoForm({ recurso, onClose, onGuardado }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const categorias = useSelector((state) => state.categorias.todas)

  const { register, control, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: yupResolver(recursoSchema),
    mode: 'onChange',
    defaultValues: {
      name: recurso?.name || '',
      description: recurso?.description || '',
      stock: recurso?.stock ?? 1,
      category: recurso?.category || '',
      status: recurso?.status || 'available',
      imagen: null,
    },
  })

  const onSubmit = async (data) => {
    try {
      // Con imagen se envía como multipart/form-data (campo "imagen") y el backend la sube a Cloudinary.
      if (recurso) {
        dispatch(modificarRecurso(await updateResourceApi(recurso._id, data)))
        toast.success(t('recursos.updated'))
      } else {
        dispatch(agregarRecurso(await createResourceApi(data)))
        toast.success(t('recursos.created'))
      }
      onGuardado?.()
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      isOpen
      onRequestClose={onClose}
      contentLabel={recurso ? t('recursos.edit') : t('recursos.new')}
      overlayClassName="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
      className="w-full max-w-lg outline-none"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
        <h2 className="text-lg font-semibold">{recurso ? t('recursos.edit') : t('recursos.new')}</h2>

        <Field error={errors.imagen}>
          <Controller name="imagen" control={control} render={({ field }) => (
            <ImageUpload value={field.value} urlActual={recurso?.imagenUrl} onChange={field.onChange} />
          )} />
        </Field>
        <Field label={t('recursos.name')} error={errors.name}>
          <input className="input" {...register('name')} />
        </Field>
        <Field label={t('recursos.description')} error={errors.description}>
          <textarea rows={3} className="input" {...register('description')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t('recursos.stock')} error={errors.stock}>
            <input type="number" min={0} className="input" {...register('stock')} />
          </Field>
          <Field label={t('recursos.category')} error={errors.category}>
            <select className="input" {...register('category')}>
              <option value="">{t('recursos.choose')}</option>
              {categorias.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label={t('recursos.status')} error={errors.status}>
            <select className="input" {...register('status')}>
              {ESTADOS_RECURSO.map((s) => <option key={s} value={s}>{t(`estadoRecurso.${s}`)}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
