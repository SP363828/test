import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-6 text-center dark:bg-night">
      <div>
        <p className="eyebrow">{t('notFound.eyebrow')}</p>
        <p className="mt-2 text-8xl font-black tracking-tighter">
          4<span className="rounded-2xl bg-brand-naranja px-2 text-ink">0</span>4
        </p>
        <p className="mt-4 text-ink-muted dark:text-slate-400">{t('notFound.text')}</p>
        <Link to="/" className="btn-primary mt-6"><ArrowLeft size={16} /> {t('notFound.back')}</Link>
      </div>
    </div>
  )
}
