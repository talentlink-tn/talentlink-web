import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function StatTile({
  icon,
  value,
  label,
  tone = 'blue',
  className,
}: {
  icon: ReactNode
  value: ReactNode
  label: string
  tone?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  className?: string
}) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }[tone]

  return (
    <div className={cn('rounded-2xl border border-surface-border bg-white p-4', className)}>
      <div className={cn('mb-3 flex size-9 items-center justify-center rounded-xl', toneClasses)}>{icon}</div>
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="mt-0.5 text-xs leading-tight text-text-secondary">{label}</div>
    </div>
  )
}
