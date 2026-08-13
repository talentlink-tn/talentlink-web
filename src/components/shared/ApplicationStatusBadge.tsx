import { Badge } from '@/components/ui/Badge'
import type { ApplicationStatus } from '@/types'

const statusConfig: Record<ApplicationStatus, { label: string; tone: 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray' }> = {
  submitted: { label: 'Envoyée', tone: 'blue' },
  under_review: { label: 'En attente', tone: 'orange' },
  interview: { label: 'En cours', tone: 'green' },
  technical_test: { label: 'Test technique', tone: 'purple' },
  decision: { label: 'Décision', tone: 'blue' },
  accepted: { label: 'Acceptée', tone: 'green' },
  refused: { label: 'Refusée', tone: 'red' },
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status]
  return <Badge tone={config.tone}>{config.label}</Badge>
}

export { statusConfig }
