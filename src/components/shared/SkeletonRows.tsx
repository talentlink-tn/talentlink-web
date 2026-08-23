import { Skeleton } from '@/components/ui/Skeleton'

// Composable placeholders built on the existing Skeleton primitive
// (shimmer already defined in index.css, previously wired up nowhere —
// every loading state fell back to a bare "Chargement…" label instead).
// Two shapes cover the app's two recurring list-item layouts: a full
// card row (JobsManagement, Team) and a compact one (CandidatesPipeline's
// kanban cards, Messages' conversation list).
//
// Every <Skeleton> below sets its own rounded-* explicitly — the
// primitive itself has no default radius (see Skeleton.tsx) since plain
// clsx can't reliably let a className override one baked in there.

export function SkeletonRow({ avatar = false }: { avatar?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-white p-4">
      {avatar && <Skeleton className="size-11 shrink-0 rounded-full" />}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
    </div>
  )
}

export function SkeletonRows({ count = 4, avatar = false }: { count?: number; avatar?: boolean }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} avatar={avatar} />
      ))}
    </div>
  )
}

export function SkeletonCompactRow() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface-muted/40 p-3">
      <Skeleton className="size-[38px] shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3 w-3/4 rounded-lg" />
        <Skeleton className="h-2.5 w-1/2 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonCompactRows({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCompactRow key={i} />
      ))}
    </div>
  )
}

/** Matches JobCard/ApplicationCard/PublicJobCard's shape (logo circle +
 * title/subtitle + a tag row) — for grid layouts (candidate Dashboard,
 * JobSearch) rather than a full-width list. */
export function SkeletonGridCard() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-surface-border bg-white p-4">
      <Skeleton className="size-[52px] shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-1/3 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-3 w-16 rounded-lg" />
          <Skeleton className="h-3 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGridCards({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonGridCard key={i} />
      ))}
    </>
  )
}

/** Matches a `divide-y` list row (Messages' conversation list) —
 * unlike SkeletonRow, no card border/radius of its own since the
 * divider comes from the parent's `divide-y`. */
export function SkeletonDivideRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3 rounded-lg" />
        <Skeleton className="h-3 w-2/3 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonDivideRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDivideRow key={i} />
      ))}
    </>
  )
}

/** Full-page block form — a few stacked lines of varying width, for
 * detail-style screens (CV, career page, job detail) rather than a
 * repeated list item. */
export function SkeletonBlock() {
  return (
    <div className="space-y-4 py-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-4 w-2/3 rounded-lg" />
      <Skeleton className="h-4 w-1/2 rounded-lg" />
      <Skeleton className="h-4 w-5/6 rounded-lg" />
    </div>
  )
}
