import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Video, Phone, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { listMyUpcomingInterviews, type InterviewForCandidateRaw } from '@/api/candidates'
import { cn } from '@/utils/cn'

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const kindLabel: Record<InterviewForCandidateRaw['kind'], string> = {
  hr: 'Entretien RH',
  technical: 'Entretien technique',
  test: 'Test',
  other: 'Entretien',
}
const formatIcon: Record<InterviewForCandidateRaw['format'], typeof Video> = {
  video: Video,
  phone: Phone,
  on_site: Building2,
}
const formatTone: Record<InterviewForCandidateRaw['format'], string> = {
  video: 'bg-blue-50 text-blue-600',
  phone: 'bg-purple-50 text-purple-600',
  on_site: 'bg-green-50 text-green-600',
}

export function Calendar() {
  const navigate = useNavigate()
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [interviews, setInterviews] = useState<InterviewForCandidateRaw[]>([])

  useEffect(() => {
    listMyUpcomingInterviews()
      .then(setInterviews)
      .catch(() => {})
  }, [])

  const events = useMemo(
    () =>
      interviews.map((iv) => {
        const d = new Date(iv.scheduled_at)
        return { iv, date: d, day: d.getDate(), month: d.getMonth(), year: d.getFullYear() }
      }),
    [interviews],
  )

  const isCurrentMonth = cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear()
  const firstWeekday = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const inCursorMonth = (e: (typeof events)[number]) => e.month === cursor.getMonth() && e.year === cursor.getFullYear()
  const dayEvents = events.filter((e) => inCursorMonth(e) && e.day === selectedDay)
  const upcomingEvents = events.filter((e) => inCursorMonth(e) && e.day >= (isCurrentMonth ? today.getDate() : 1))

  const displayed = dayEvents.length > 0 ? dayEvents : upcomingEvents

  return (
    <div className="pb-6">
      <PageHeader title="Calendrier" />

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="text-sm font-bold text-text-primary">
            {monthNames[cursor.getMonth()]} {cursor.getFullYear()}
          </h2>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-surface-border bg-white p-3.5">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-text-tertiary">
            {weekDays.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const hasEvent = day !== null && events.some((e) => inCursorMonth(e) && e.day === day)
              const isToday = isCurrentMonth && day === today.getDate()
              const isSelected = day === selectedDay
              return (
                <button
                  key={i}
                  disabled={day === null}
                  onClick={() => day && setSelectedDay(day)}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-lg text-sm font-medium',
                    !day && 'invisible',
                    isSelected ? 'bg-brand-gradient text-white' : isToday ? 'bg-brand-blue-50 text-brand-blue-600' : 'text-text-primary hover:bg-surface-muted',
                  )}
                >
                  {day}
                  {hasEvent && !isSelected && <span className="absolute bottom-1 size-1 rounded-full bg-brand-green-500" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-text-primary">
            {dayEvents.length > 0 ? `Événements du ${selectedDay} ${monthNames[cursor.getMonth()]}` : 'Événements à venir'}
          </h3>
          <div className="space-y-2.5">
            {displayed.map((e) => {
              const Icon = formatIcon[e.iv.format]
              return (
                <button
                  key={e.iv.id}
                  onClick={() => navigate('/app/applications')}
                  className="flex w-full items-center gap-3 rounded-xl border border-surface-border bg-white p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-blue-200 hover:shadow-sm"
                >
                  <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', formatTone[e.iv.format])}>
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{kindLabel[e.iv.kind]}</p>
                    <p className="text-xs text-text-secondary">
                      {isCurrentMonth && e.day === today.getDate() ? "Aujourd'hui" : `${e.day} ${monthNames[cursor.getMonth()]}`} à{' '}
                      {e.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
              )
            })}
            {displayed.length === 0 && <p className="py-6 text-center text-sm text-text-tertiary">Aucun entretien planifié ce mois-ci.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
