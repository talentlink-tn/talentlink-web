import { useState } from 'react'
import { FileText, Download, GraduationCap, PlayCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

const documents = [
  { name: 'Bulletin de paie — Avril 2026', date: '30 Avr 2026', category: 'Paie' },
  { name: 'Contrat de travail — CDI', date: '01 Jan 2023', category: 'Contrat' },
  { name: 'Attestation de travail', date: '12 Fév 2026', category: 'Attestation' },
  { name: 'Bulletin de paie — Mars 2026', date: '31 Mar 2026', category: 'Paie' },
  { name: 'Règlement intérieur', date: '01 Jan 2026', category: 'RH' },
]

const trainings = [
  { name: 'Sécurité informatique', progress: 80, status: 'En cours' },
  { name: 'Leadership et management', progress: 45, status: 'En cours' },
  { name: 'Onboarding Talent Link', progress: 100, status: 'Terminée' },
]

const tabs = ['Documents', 'Formations'] as const

export function EmployeeDocuments() {
  const { showToast } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Documents')

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Documents & Formations" />

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

      {tab === 'Documents' ? (
        <div className="mt-5 space-y-2.5">
          {documents.map((doc) => (
            <button
              key={doc.name}
              onClick={() => showToast('Téléchargement démarré…')}
              className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-white p-3.5 text-left"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <FileText className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text-primary">{doc.name}</span>
                <span className="block text-xs text-text-tertiary">{doc.date}</span>
              </span>
              <Badge tone="gray">{doc.category}</Badge>
              <Download className="size-4 shrink-0 text-text-tertiary" />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {trainings.map((t) => (
            <div key={t.name} className="rounded-2xl border border-surface-border bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <GraduationCap className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary">{t.name}</span>
                  <span className="block text-xs text-text-tertiary">{t.status}</span>
                </span>
                <button onClick={() => showToast(`Reprise de "${t.name}"`)} className="text-brand-blue-600">
                  <PlayCircle className="size-5" />
                </button>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className={cn('h-full rounded-full', t.progress === 100 ? 'bg-green-500' : 'bg-brand-gradient')} style={{ width: `${t.progress}%` }} />
              </div>
              <p className="mt-1 text-right text-[11px] text-text-tertiary">{t.progress}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
