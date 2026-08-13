import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Home, Briefcase, FileText, MessageSquare, User, Settings, HelpCircle, LogOut, Bookmark,
  Search, Calendar, X,
} from 'lucide-react'
import { Logo } from './Logo'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/context/AppContext'
import { getMyCandidateProfile } from '@/api/candidates'
import { resolveUploadUrl } from '@/api/client'
import { candidateProfile } from '@/data/profile'

const links = [
  { to: '/app', label: 'Accueil', icon: Home },
  { to: '/app/jobs', label: "Offres d'emploi", icon: Briefcase },
  { to: '/app/applications', label: 'Mes candidatures', icon: FileText },
  { to: '/app/favorites', label: 'Offres favorites', icon: Bookmark },
  { to: '/app/search', label: 'Recherche avancée', icon: Search },
  { to: '/app/calendar', label: 'Calendrier', icon: Calendar },
  { to: '/app/messages', label: 'Messages', icon: MessageSquare },
  { to: '/app/profile', label: 'Mon profil', icon: User },
]

const bottomLinks = [
  { to: '/app/settings', label: 'Paramètres', icon: Settings },
  { to: '/app/help', label: 'Aide et support', icon: HelpCircle },
]

export function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { logout, authKind } = useApp()
  // The "employee" demo profile has no backend (see AppContext) — it
  // keeps showing the mocked candidateProfile; a real candidate session
  // fetches its own name instead.
  const [displayName, setDisplayName] = useState(`${candidateProfile.firstName} ${candidateProfile.lastName}`)
  const [displayTitle, setDisplayTitle] = useState(candidateProfile.title)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(candidateProfile.avatar)

  useEffect(() => {
    if (authKind !== 'candidate') return
    getMyCandidateProfile()
      .then((p) => {
        setDisplayName(`${p.first_name} ${p.last_name}`)
        setDisplayTitle(p.headline ?? '')
        setAvatarUrl(p.photo_url ? resolveUploadUrl(p.photo_url) : undefined)
      })
      .catch(() => {})
  }, [authKind])

  const go = (to: string) => {
    navigate(to)
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative z-10 flex h-full w-[85%] max-w-[300px] flex-col bg-white p-5 pt-[max(1.25rem,env(safe-area-inset-top))] shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo size={30} textClassName="text-[16px]" />
              <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted" aria-label="Fermer">
                <X className="size-4" />
              </button>
            </div>

            <button onClick={() => go('/app/profile')} className="mb-5 flex items-center gap-3 rounded-2xl bg-surface-muted p-3 text-left">
              <Avatar name={displayName} src={avatarUrl} size={44} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text-primary">{displayName}</span>
                <span className="block truncate text-xs text-text-secondary">{displayTitle}</span>
              </span>
            </button>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {links.map((l) => (
                <button
                  key={l.to}
                  onClick={() => go(l.to)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-muted"
                >
                  <l.icon className="size-[18px] text-text-secondary" />
                  {l.label}
                </button>
              ))}
            </nav>

            <div className="mt-4 space-y-1 border-t border-surface-border pt-3">
              {bottomLinks.map((l) => (
                <button
                  key={l.to}
                  onClick={() => go(l.to)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-muted"
                >
                  <l.icon className="size-[18px] text-text-secondary" />
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                  onClose()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-[18px]" />
                Se déconnecter
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
