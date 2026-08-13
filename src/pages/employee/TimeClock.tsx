import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Coffee, RotateCcw, LogOut, History } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

type Stage = 'idle' | 'in' | 'lunch' | 'resumed' | 'out'

const stageMeta: Record<Exclude<Stage, 'idle'>, { label: string; icon: typeof LogIn }> = {
  in: { label: 'Entrée', icon: LogIn },
  lunch: { label: 'Pause déjeuner', icon: Coffee },
  resumed: { label: 'Reprise', icon: RotateCcw },
  out: { label: 'Sortie', icon: LogOut },
}

const nextStage: Record<Stage, Exclude<Stage, 'idle'> | null> = {
  idle: 'in',
  in: 'lunch',
  lunch: 'resumed',
  resumed: 'out',
  out: null,
}

const actionLabel: Record<Stage, string> = {
  idle: "Pointer l'entrée",
  in: 'Pointer la pause déjeuner',
  lunch: 'Pointer la reprise',
  resumed: 'Pointer la sortie',
  out: 'Journée terminée',
}

export function TimeClock() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [now, setNow] = useState(new Date())
  const [stage, setStage] = useState<Stage>('idle')
  const [times, setTimes] = useState<Partial<Record<Exclude<Stage, 'idle'>, string>>>({})

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const handleClock = () => {
    const next = nextStage[stage]
    if (!next) return
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    setTimes((t) => ({ ...t, [next]: time }))
    setStage(next)
    showToast(`${stageMeta[next].label} enregistrée à ${time}`)
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Pointage" />

      <p className="mt-4 text-sm text-text-secondary">
        {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="mt-4 rounded-2xl bg-ink-950 p-8 text-center">
        <p className="font-mono text-4xl font-bold text-white">{now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="mt-2 text-sm text-white/60">{stage === 'idle' ? "Vous n'avez pas encore pointé" : `Statut : ${stageMeta[stage as Exclude<Stage, 'idle'>].label} effectué`}</p>
      </div>

      <Button size="lg" fullWidth className="mt-5" disabled={stage === 'out'} onClick={handleClock}>
        {actionLabel[stage]}
      </Button>

      <h3 className="mt-6 mb-2 text-sm font-bold text-text-primary">Aujourd'hui</h3>
      <div className="space-y-2.5">
        {(Object.keys(stageMeta) as Exclude<Stage, 'idle'>[]).map((key) => {
          const meta = stageMeta[key]
          const done = !!times[key]
          return (
            <div key={key} className="flex items-center gap-3 rounded-xl border border-surface-border bg-white p-3.5">
              <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', done ? 'bg-green-50 text-green-600' : 'bg-surface-muted text-text-tertiary')}>
                <meta.icon className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-text-primary">{meta.label}</span>
              <span className={cn('text-sm font-semibold', done ? 'text-text-primary' : 'text-text-tertiary')}>{times[key] ?? '--:--'}</span>
            </div>
          )
        })}
      </div>

      <button onClick={() => navigate('/app/calendar')} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-brand-blue-600">
        <History className="size-4" />
        Voir mon historique
      </button>
    </div>
  )
}
