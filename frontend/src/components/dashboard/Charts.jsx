import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { ESTADOS_RESERVA } from '../../utils/constants'

// Chart.js es modular: hay que registrar las piezas que se usan.
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Title, Tooltip, Legend)

// Colores de las series: azul, naranja y un menta más oscuro que el de la marca (se lee mejor en una gráfica).
const SERIES = ['#5584ff', '#fb6435', '#1baf7a']

// Gris medio: se lee bien tanto sobre fondo claro como oscuro.
const TEXTO = '#8a8f98'
const GRILLA = 'rgba(148, 163, 184, 0.25)'
const FUENTE = { family: 'DM Mono', size: 12 }

// Opciones comunes a las 3 gráficas.
const opcionesBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false, labels: { color: TEXTO, font: FUENTE, usePointStyle: true } },
    tooltip: { backgroundColor: '#000', titleColor: '#def294', bodyColor: '#fff', cornerRadius: 12, padding: 10 },
  },
}

// Opciones para las gráficas con ejes (barras y línea).
const opcionesEjes = {
  ...opcionesBase,
  scales: {
    x: { ticks: { color: TEXTO, font: FUENTE }, grid: { display: false }, border: { display: false } },
    y: { beginAtZero: true, ticks: { color: TEXTO, font: FUENTE, precision: 0 }, grid: { color: GRILLA }, border: { display: false } },
  },
}

const opcionesDona = {
  ...opcionesBase,
  cutout: '60%',
  plugins: { ...opcionesBase.plugins, legend: { ...opcionesBase.plugins.legend, display: true, position: 'bottom' } },
}

export default function Charts() {
  const { t } = useTranslation()
  const reservas = useSelector((s) => s.reservas.todas)
  const recursos = useSelector((s) => s.recursos.todos)

  // Reservas por recurso: cuántas reservas incluyen cada recurso.
  const porRecurso = useMemo(() => {
    const counts = {}
    reservas.forEach((r) => r.resources.forEach((id) => { counts[id] = (counts[id] || 0) + 1 }))
    const top = Object.entries(counts)
      .map(([id, total]) => ({ name: recursos.find((x) => x._id === id)?.name || t('charts.eliminado'), total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
    return {
      labels: top.map((d) => d.name),
      datasets: [{ label: t('charts.reservas'), data: top.map((d) => d.total), backgroundColor: SERIES[0], borderRadius: 4, maxBarThickness: 36 }],
    }
  }, [reservas, recursos, t])

  const porEstado = useMemo(() => {
    const counts = {}
    reservas.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1 })
    const presentes = ESTADOS_RESERVA.filter((k) => counts[k] > 0)
    return {
      labels: presentes.map((k) => t(`estadosReserva.${k}`)),
      datasets: [{ data: presentes.map((k) => counts[k]), backgroundColor: SERIES, borderWidth: 0, spacing: 2 }],
    }
  }, [reservas, t])

  // Reservas por mes de inicio (últimos 6 meses hasta el próximo).
  const porMes = useMemo(() => {
    const meses = t('fechas.mesesCortos', { returnObjects: true })
    const now = new Date()
    const months = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      return { key: `${d.getFullYear()}-${d.getMonth()}`, name: meses[d.getMonth()], total: 0 }
    })
    reservas.forEach((r) => {
      const d = new Date(r.fechaInicio)
      const m = months.find((x) => x.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`)
      if (m) m.total++
    })
    return {
      labels: months.map((m) => m.name),
      datasets: [{
        label: t('charts.reservas'),
        data: months.map((m) => m.total),
        borderColor: SERIES[0],
        backgroundColor: 'rgba(85, 132, 255, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: SERIES[0],
      }],
    }
  }, [reservas, t])

  if (reservas.length === 0) {
    return <div className="card text-center text-sm text-ink-muted">{t('charts.empty')}</div>
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title={t('charts.porRecurso')}>
        <Bar data={porRecurso} options={opcionesEjes} />
      </ChartCard>

      <ChartCard title={t('charts.porEstado')}>
        <Doughnut data={porEstado} options={opcionesDona} />
      </ChartCard>

      <ChartCard title={t('charts.porMes')} className="lg:col-span-2">
        <Line data={porMes} options={opcionesEjes} />
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <h3 className="mb-4 eyebrow">{title}</h3>
      {/* El contenedor necesita alto fijo porque maintainAspectRatio es false */}
      <div className="relative h-64">{children}</div>
    </div>
  )
}
