import { useTranslation } from 'react-i18next'

// Fecha en bloque: día grande y mes abreviado.
// Se usa UTC porque las fechas se guardan como medianoche de ese día.
export default function DateBlock({ fecha, color = 'bg-paper-alt dark:bg-night' }) {
  const { t } = useTranslation()
  const meses = t('fechas.mesesCortos', { returnObjects: true })
  const d = new Date(fecha)
  return (
    <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${color}`}>
      <span className="text-xl leading-none font-bold">{d.getUTCDate()}</span>
      <span className="mt-0.5 font-mono text-[10px] tracking-wider">{meses[d.getUTCMonth()].toUpperCase()}</span>
    </div>
  )
}
