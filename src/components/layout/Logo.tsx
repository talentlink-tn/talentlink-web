import { Link } from 'react-router-dom'
import logoMark from '@/assets/logo-mark.svg'
import { cn } from '@/utils/cn'

// logo-mark.svg's viewBox is cropped tight to its visible ink (see that
// file), computed by rasterizing the mark and scanning for the true
// non-transparent pixel bounding box rather than eyeballing a screenshot
// — an earlier eyeballed crop clipped real content on both sides
// (worse on the right, cutting into the loop). 229.9 wide by 155.9
// tall, not square, so the rendered <img> needs the matching ratio.
const LOGO_ASPECT = 155.9 / 229.9

export function Logo({
  size = 40,
  withText = true,
  textClassName,
  dark,
  to,
}: {
  size?: number
  withText?: boolean
  textClassName?: string
  dark?: boolean
  /** When set, the whole mark becomes a link (e.g. "back to home/dashboard")
   * with a subtle hover affordance — omit for purely decorative contexts
   * (Login/Splash/AuthBrandPanel) where a click wouldn't make sense. */
  to?: string
}) {
  const content = (
    <span className="inline-flex items-center gap-2.5">
      <img src={logoMark} alt="" width={size} height={size * LOGO_ASPECT} style={{ width: size, height: size * LOGO_ASPECT }} />
      {withText && (
        <span className={cn('text-xl font-extrabold tracking-tight', textClassName)}>
          <span className={dark ? 'text-white' : 'text-text-primary'}>Talent</span>{' '}
          <span className="text-brand-green-500">Link</span>
        </span>
      )}
    </span>
  )

  if (!to) return content

  return (
    <Link
      to={to}
      className="inline-flex items-center transition-opacity duration-150 hover:opacity-75 active:opacity-60"
      aria-label="Retour à l'accueil"
    >
      {content}
    </Link>
  )
}
