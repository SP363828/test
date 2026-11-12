import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import AuthLayout, { FormError } from '../components/layout/AuthLayout'
import Spinner from '../components/ui/Spinner'
import Field from '../components/ui/Field'
import PasswordInput from '../components/ui/PasswordInput'
import { iniciarSesion } from '../features/auth/authSlice'
import { loginApi } from '../api/auth'
import { loginSchema } from '../validation/schemas'

export default function Login() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorApi, setErrorApi] = useState(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  // watch(): el botón queda deshabilitado mientras algún campo esté vacío.
  const [username, password] = watch(['username', 'password'])
  const camposVacios = !username?.trim() || !password

  const onSubmit = async (data) => {
    setErrorApi(null)
    try {
      const respuesta = await loginApi(data)
      dispatch(iniciarSesion(respuesta))
      toast.success(t('auth.hello', { name: respuesta.usuario.username }))
      // Si venía de una ruta protegida, vuelve a ella.
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      setErrorApi(error.message)
    }
  }

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError>{errorApi}</FormError>
        <Field label={t('auth.username')} error={errors.username}>
          <input className="input" autoComplete="username" autoFocus {...register('username')} />
        </Field>
        <Field label={t('auth.password')} error={errors.password}>
          <PasswordInput autoComplete="current-password" {...register('password')} />
        </Field>
        <button type="submit" className="btn-primary w-full" disabled={camposVacios || isSubmitting}>
          {isSubmitting && <Spinner />} {t('auth.login')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        {t('auth.noAccount')} <Link to="/register" className="font-semibold text-ink underline underline-offset-4 dark:text-paper">{t('auth.goRegister')}</Link>
      </p>
    </AuthLayout>
  )
}
