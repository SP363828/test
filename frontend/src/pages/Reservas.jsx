import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import ReservaForm from '../components/reservas/ReservaForm'
import ReservaList from '../components/reservas/ReservaList'

export default function Reservas() {
  const { t } = useTranslation()
  // ?recurso=<id> llega desde el recomendador de IA o desde un recurso para precargar el formulario.
  const [params] = useSearchParams()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('reservas.pageEyebrow')}
        title={t('reservas.pageTitle')}
        description={t('reservas.pageDesc')}
      />
      <ReservaForm recursoPreseleccionado={params.get('recurso')} />
      <ReservaList />
    </div>
  )
}
