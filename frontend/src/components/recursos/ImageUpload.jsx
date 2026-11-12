import { useTranslation } from 'react-i18next'
import { useEffect, useMemo } from 'react'
import { ImageIcon } from 'lucide-react'

// Selector de imagen con vista previa. Devuelve el File (o null) por onChange.
export default function ImageUpload({ value, urlActual, onChange }) {
  const { t } = useTranslation()
  // URL temporal del archivo elegido para mostrarlo antes de subirlo.
  const urlLocal = useMemo(() => (value ? URL.createObjectURL(value) : null), [value])
  useEffect(() => () => urlLocal && URL.revokeObjectURL(urlLocal), [urlLocal])

  const preview = urlLocal || urlActual

  return (
    <div className="flex items-center gap-4">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper-alt text-ink-muted dark:bg-night">
        {preview ? <img src={preview} alt={t('recursos.preview')} className="h-full w-full object-cover" /> : <ImageIcon size={28} strokeWidth={1.5} />}
      </div>
      <div className="flex flex-col gap-1">
        <label className="btn-secondary btn-sm cursor-pointer">
          {preview ? t('recursos.changeImage') : t('recursos.uploadImage')}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
        </label>
        <span className="text-xs text-ink-muted dark:text-slate-400">{t('recursos.imageHint')}</span>
      </div>
    </div>
  )
}
