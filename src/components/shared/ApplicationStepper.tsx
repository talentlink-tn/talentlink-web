import { Check } from 'lucide-react'
import type { ApplicationStep } from '@/types'
import { cn } from '@/utils/cn'

export function ApplicationStepper({ steps }: { steps: ApplicationStep[] }) {
  return (
    <div className="flex items-start">
      {steps.map((step, i) => (
        <div key={step.key} className="flex flex-1 flex-col items-center">
          <div className="flex w-full items-center">
            {i > 0 && (
              <span
                className={cn('h-0.5 flex-1', step.state === 'upcoming' ? 'bg-surface-border' : 'bg-brand-blue-500')}
              />
            )}
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                step.state === 'done' && 'bg-green-500 text-white',
                step.state === 'current' && 'bg-brand-blue-500 text-white',
                step.state === 'upcoming' && 'bg-surface-border text-text-tertiary',
              )}
            >
              {step.state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
          </div>
          <span className="mt-1.5 max-w-[70px] text-center text-[10px] leading-tight font-medium text-text-secondary">
            {step.label}
          </span>
          {step.date && <span className="text-center text-[9px] text-text-tertiary">{step.date}</span>}
        </div>
      ))}
    </div>
  )
}
