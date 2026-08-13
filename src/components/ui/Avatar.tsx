import { cn } from '@/utils/cn'

export function Avatar({
  name,
  color = '#2F6FED',
  size = 40,
  online,
  className,
  src,
}: {
  name: string
  color?: string
  size?: number
  online?: boolean
  className?: string
  src?: string
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span className={cn('relative inline-flex shrink-0', className)} style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full font-semibold text-white"
          style={{ backgroundColor: color, fontSize: size * 0.38 }}
        >
          {initials}
        </span>
      )}
      {online && (
        <span
          className="absolute right-0 bottom-0 rounded-full bg-green-500 ring-2 ring-white"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </span>
  )
}
