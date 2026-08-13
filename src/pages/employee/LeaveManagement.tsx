import { useState } from 'react'
import { Palmtree, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

interface LeaveRequest {
  id: string
  type: string
  range: string
  status: 'approved' | 'refused' | 'pending'
}

const statusConfig = {
  approved: { label: 'Approuvé', tone: 'green' as const },
  refused: { label: 'Refusé', tone: 'red' as const },
  pending: { label: 'En attente', tone: 'orange' as const },
}

const tabs = ['Mes demandes', 'Solde'] as const

export function LeaveManagement() {
  const { showToast } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Mes demandes')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [leaveType, setLeaveType] = useState('Congé annuel')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [requests, setRequests] = useState<LeaveRequest[]>([
    { id: 'r1', type: 'Congé annuel', range: 'Du 10 Mai au 17 Mai 2026', status: 'approved' },
    { id: 'r2', type: 'Congé maladie', range: 'Le 22 Avril 2026', status: 'approved' },
    { id: 'r3', type: 'Congé annuel', range: 'Du 5 Avr au 7 Avr 2026', status: 'refused' },
  ])

  const submitRequest = () => {
    if (!startDate) {
      showToast('Veuillez choisir une date de début.')
      return
    }
    const range = endDate ? `Du ${formatDate(startDate)} au ${formatDate(endDate)}` : `Le ${formatDate(startDate)}`
    setRequests((r) => [{ id: `r-${Date.now()}`, type: leaveType, range, status: 'pending' }, ...r])
    setSheetOpen(false)
    setStartDate('')
    setEndDate('')
    showToast('Demande de congé envoyée !')
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Congés" />

      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-xl border py-2 text-sm font-semibold',
              tab === t ? 'border-brand-blue-500 bg-brand-blue-500 text-white' : 'border-surface-border bg-white text-text-secondary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Solde' ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl bg-brand-gradient p-5 text-white">
            <Palmtree className="mb-2 size-6" />
            <p className="text-3xl font-extrabold">12 jours</p>
            <p className="text-sm text-white/80">Solde disponible pour l'année 2026</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-surface-border bg-white py-3">
              <p className="text-lg font-bold text-text-primary">18</p>
              <p className="text-[10px] text-text-tertiary">Jours acquis</p>
            </div>
            <div className="rounded-xl border border-surface-border bg-white py-3">
              <p className="text-lg font-bold text-text-primary">6</p>
              <p className="text-[10px] text-text-tertiary">Jours pris</p>
            </div>
            <div className="rounded-xl border border-surface-border bg-white py-3">
              <p className="text-lg font-bold text-text-primary">12</p>
              <p className="text-[10px] text-text-tertiary">Restants</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Button fullWidth className="mt-5" onClick={() => setSheetOpen(true)}>
            <Plus className="size-[18px]" />
            Nouvelle demande
          </Button>

          <h3 className="mt-6 mb-2 text-sm font-bold text-text-primary">Demandes récentes</h3>
          <div className="space-y-2.5">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{r.type}</p>
                  <p className="text-xs text-text-secondary">{r.range}</p>
                </div>
                <Badge tone={statusConfig[r.status].tone}>{statusConfig[r.status].label}</Badge>
              </div>
            ))}
          </div>
        </>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Nouvelle demande de congé">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-primary">Type de congé</span>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            >
              <option>Congé annuel</option>
              <option>Congé maladie</option>
              <option>Congé sans solde</option>
              <option>Congé exceptionnel</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-primary">Date de début</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-primary">Date de fin</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none" />
            </label>
          </div>
          <Button fullWidth onClick={submitRequest}>
            Envoyer la demande
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

function formatDate(value: string) {
  const d = new Date(value)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
