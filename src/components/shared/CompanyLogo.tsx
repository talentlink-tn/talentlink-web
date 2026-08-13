import { cn } from '@/utils/cn'

export function CompanyLogo({ name, color, className, size = 48 }: { name: string; color: string; className?: string; size?: number }) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-white font-extrabold', className)}
      style={{ width: size, height: size, color, fontSize: name.length > 4 ? size * 0.19 : size * 0.32 }}
    >
      {name}
    </span>
  )
}
