import logoMark from '@/assets/logo-mark.svg'
import { cn } from '@/utils/cn'

export function Logo({ size = 40, withText = true, textClassName, dark }: { size?: number; withText?: boolean; textClassName?: string; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src={logoMark} alt="" width={size} height={size} style={{ width: size, height: size * 0.875 }} />
      {withText && (
        <span className={cn('text-xl font-extrabold tracking-tight', textClassName)}>
          <span className={dark ? 'text-white' : 'text-text-primary'}>Talent</span>{' '}
          <span className="text-brand-green-500">Link</span>
        </span>
      )}
    </span>
  )
}
