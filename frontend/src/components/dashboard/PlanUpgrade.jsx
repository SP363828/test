import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Check, Crown, Sparkles } from 'lucide-react'
import Spinner from '../ui/Spinner'
import { iniciarSesion } from '../../features/auth/authSlice'
import { upgradePlanApi } from '../../api/auth'

// Cambio de plan plus → premium (solo si corresponde).
export default function PlanUpgrade() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const usuario = useSelector((state) => state.auth.usuario)
  const [cargando, setCargando] = useState(false)

  if (usuario?.rol === 'admin') return null

  if (usuario?.plan === 'premium') {
    return (
      <div id="plan" className="flex flex-col justify-between rounded-xl bg-brand-lavanda p-5 text-ink">
        <p className="eyebrow text-ink/70">{t('plan.yours')}</p>
        <div>
          <Sparkles size={28} strokeWidth={1.5} />
          <p className="mt-2 text-xl font-bold">{t('plan.already')}</p>
          <p className="text-sm text-ink/70">{t('plan.noLimit')}</p>
        </div>
      </div>
    )
  }

  const cambiarPlan = async () => {
    setCargando(true)
    try {
      // La API devuelve un token nuevo con plan "premium": hay que reemplazar la sesión,
      // porque el backend toma el plan desde el token.
      const respuesta = await upgradePlanApi()
      dispatch(iniciarSesion(respuesta))
      toast.success(t('plan.upgraded'))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div id="plan" className="rounded-xl bg-ink p-5 text-paper dark:ring-1 dark:ring-night-line">
      <p className="eyebrow flex items-center gap-1 text-slate-400"><Crown size={14} /> Premium</p>
      <p className="mt-2 text-xl font-bold">{t('plan.title')}</p>
      <ul className="mt-3 space-y-1 text-sm text-slate-300">
        {[t('plan.benefit1'), t('plan.benefit2'), t('plan.benefit3')].map((b) => (
          <li key={b} className="flex items-center gap-2"><Check size={14} className="text-brand-lima" /> {b}</li>
        ))}
      </ul>
      <button onClick={cambiarPlan} disabled={cargando} className="btn-accent mt-4 w-full">
        {cargando && <Spinner />} {t('plan.cta')}
      </button>
    </div>
  )
}
