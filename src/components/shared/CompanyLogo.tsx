import { cn } from '@/utils/cn'

export function CompanyLogo({
  name,
  color,
  className,
  size = 48,
  src,
}: {
  name: string
  color: string
  className?: string
  size?: number
  /** Pre-resolved image URL (via resolveUploadUrl) — falls back to the
   * colored-initials placeholder when absent, same convention as
   * Avatar's own `src` prop. */
  src?: string
}) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-white font-extrabold', className)}
      style={{ width: size, height: size, color, fontSize: name.length > 4 ? size * 0.19 : size * 0.32 }}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : name}
    </span>
  )
}
