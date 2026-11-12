import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import Spinner from '../ui/Spinner'
import BotonTraducir from '../ui/BotonTraducir'
import { useTraduccion } from '../../utils/useTraduccion'
import { recommendResourceApi } from '../../api/extras'

const EJEMPLOS = ['ia.example1', 'ia.example2', 'ia.example3']

// Recomendador con IA: el usuario describe qué necesita y Gemini (vía backend) sugiere un recurso.
export default function AiRecommender() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const recursos = useSelector((state) => state.recursos.todos)
  const [descripcion, setDescripcion] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const valida = descripcion.trim().length >= 5

  const preguntar = async (e) => {
    e.preventDefault()
    if (!valida) return
    setCargando(true)
    setError(null)
    setResultado(null)
    try {
      const data = await recommendResourceApi(descripcion.trim())
      // Si la IA no está disponible el backend responde 200 con recommendation: null.
      if (!data.recommendation) setError(data.message || t('ia.unavailable'))
      else setResultado(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const recurso = resultado && recursos.find((r) => r.name === resultado.recommendation)

  return (
    <div id="ia" className="scroll-mt-24 rounded-xl bg-brand-rosa p-5 text-ink md:p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={20} />
        <p className="eyebrow text-ink/70">{t('ia.eyebrow')}</p>
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">{t('ia.title')}</h2>
      <p className="text-sm text-ink/70">{t('ia.subtitle')}</p>

      <form onSubmit={preguntar} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="input border-transparent"
          placeholder={t('ia.placeholder')}
          value={descripcion}
          maxLength={300}
          onChange={(e) => setDescripcion(e.target.value)}
          aria-label={t('ia.label')}
        />
        <button className="btn-primary shrink-0" disabled={!valida || cargando}>
          {cargando ? <><Spinner /> {t('ia.thinking')}</> : t('ia.recommend')}
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {EJEMPLOS.map((ej) => (
          <button key={ej} type="button" onClick={() => setDescripcion(t(ej))} className="rounded-full bg-paper/60 px-3 py-1 text-xs hover:bg-paper">
            {t(ej)}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm font-medium">{error}</p>}
      {resultado && (
        <Recomendacion resultado={resultado} onReservar={recurso && (() => navigate(`/reservas?recurso=${recurso._id}`))} />
      )}
    </div>
  )
}

// Componente aparte: al pedir otra recomendación se desmonta y la traducción vuelve a empezar.
function Recomendacion({ resultado, onReservar }) {
  const { t } = useTranslation()
  const traduccion = useTraduccion([resultado.recommendation, resultado.reason])

  return (
    <div className="mt-4 rounded-xl bg-paper p-4">
      <p className="eyebrow">{t('ia.weRecommend')}</p>
      <p className="mt-1 text-lg font-semibold">{traduccion.traducir(resultado.recommendation)}</p>
      <p className="mt-1 text-sm text-ink-soft">{traduccion.traducir(resultado.reason)}</p>
      <BotonTraducir traduccion={traduccion} className="mt-1" />
      {onReservar && (
        <button className="btn-primary btn-sm mt-3 flex" onClick={onReservar}>
          {t('ia.book')} <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}
