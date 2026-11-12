import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

// Selección múltiple con "chips". value es un array de strings.
export default function ChipSelect({ options, value = [], onChange }) {
  const { t } = useTranslation()
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const activo = value.includes(o.value)
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => toggle(o.value)}
            disabled={o.disabled}
            aria-pressed={activo}
            title={o.disabled ? t('common.notAvailable') : undefined}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${
              activo
                ? 'border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink'
                : 'border-line bg-paper hover:border-ink dark:border-night-line dark:bg-night dark:hover:border-slate-400'
            }`}
          >
            {activo && <Check size={12} strokeWidth={3} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
