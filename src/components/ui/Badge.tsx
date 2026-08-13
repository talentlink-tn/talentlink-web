import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray' | 'teal'

const toneClasses: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700',
  blue: 'bg-blue-50 text-blue-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-600',
  gray: 'bg-surface-muted text-text-secondary',
  teal: 'bg-teal-50 text-teal-700',
}

export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
