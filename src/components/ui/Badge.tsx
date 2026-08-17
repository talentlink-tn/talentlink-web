import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray' | 'teal'

// A thin, tone-matched border adds definition the flat 50/700 pastel
// pairing alone doesn't — cheap, consistent "richer" read across every
// status pill/tag in the app without changing the underlying hues.
const toneClasses: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700 border border-green-200/70',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200/70',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200/70',
  orange: 'bg-orange-50 text-orange-700 border border-orange-200/70',
  red: 'bg-red-50 text-red-600 border border-red-200/70',
  gray: 'bg-surface-muted text-text-secondary border border-surface-border',
  teal: 'bg-teal-50 text-teal-700 border border-teal-200/70',
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
