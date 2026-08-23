import { cn } from '@/utils/cn'

// No default border-radius baked in — plain clsx concatenation can't
// reliably let a caller's `rounded-full`/`rounded-xl` override a
// hardcoded `rounded-lg` here (both end up in the class list; which
// one's CSS rule wins depends on Tailwind's generated stylesheet
// order, not attribute order, so it isn't safe to assume the override
// wins). Every caller passes its own radius explicitly instead.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}
