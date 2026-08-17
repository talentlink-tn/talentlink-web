import { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { SideDrawer } from './SideDrawer'
import { useApp } from '@/context/AppContext'

export function TopHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { unreadNotificationsCount } = useApp()

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-border bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-muted"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </button>
        <Logo size={34} textClassName="text-[18px]" to="/app" />
        <button
          onClick={() => navigate('/app/notifications')}
          className="relative flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </header>
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
