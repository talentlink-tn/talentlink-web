import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PageHeader({ title, action, onBack }: { title: string; action?: ReactNode; onBack?: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-surface-border bg-white/95 px-4 py-3.5 backdrop-blur">
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-muted"
        aria-label="Retour"
      >
        <ChevronLeft className="size-5" />
      </button>
      <h1 className="flex-1 truncate px-2 text-center text-base font-bold text-text-primary">{title}</h1>
      <div className="flex size-9 items-center justify-center">{action}</div>
    </div>
  )
}
