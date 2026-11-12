import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import AuthLayout, { FormError } from '../components/layout/AuthLayout'
import Spinner from '../components/ui/Spinner'
import Field from '../components/ui/Field'
import PasswordInput from '../components/ui/PasswordInput'
import PasswordStrength from '../components/ui/PasswordStrength'
import { iniciarSesion } from '../features/auth/authSlice'
import { registerApi } from '../api/auth'
import { registerSchema } from '../validation/schemas'

export default function Register() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [errorApi, setErrorApi] = useState(null)

  // mode "onChange": isValid se recalcula mientras el usuario escribe,
  // así el botón queda deshabilitado mientras haya algún dato inválido.
  const { register, handleSubmit, watch, formState: { errors, isValid, isSubmitting } } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { username: '', email: '', password: '', passwordRepeat: '', aceptaTerminos: false },
  })

  const onSubmit = async ({ username, email, password, passwordRepeat }) => {
    setErrorApi(null)
    try {
      const respuesta = await registerApi({ username, email, password, passwordRepeat })
      // Auto-login: la API ya devuelve el token, se guarda la sesión directamente.
      dispatch(iniciarSesion(respuesta))
      toast.success(t('auth.registered'))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorApi(error.message)
    }
  }

  const inputClass = (campo) => `input ${errors[campo] ? 'input-error' : ''}`

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError>{errorApi}</FormError>
        <Field label={t('auth.username')} error={errors.username}>
          <input className={inputClass('username')} autoComplete="username" autoFocus {...register('username')} />
        </Field>
        <Field label={t('auth.email')} error={errors.email}>
          <input className={inputClass('email')} type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label={t('auth.password')} error={errors.password}>
          <PasswordInput className={errors.password ? 'input-error' : ''} autoComplete="new-password" {...register('password')} />
          <PasswordStrength password={watch('password')} />
        </Field>
        <Field label={t('auth.passwordRepeat')} error={errors.passwordRepeat}>
          <PasswordInput className={errors.passwordRepeat ? 'input-error' : ''} autoComplete="new-password" {...register('passwordRepeat', { deps: ['password'] })} />
        </Field>
        <Field error={errors.aceptaTerminos}>
          <label className="flex items-center gap-2 text-sm text-ink-soft dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-black" {...register('aceptaTerminos')} />
            {t('auth.acceptTerms')}
          </label>
        </Field>
        <button type="submit" className="btn-primary w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting && <Spinner />} {t('auth.register')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        {t('auth.hasAccount')} <Link to="/login" className="font-semibold text-ink underline underline-offset-4 dark:text-paper">{t('auth.goLogin')}</Link>
      </p>
    </AuthLayout>
  )
}
