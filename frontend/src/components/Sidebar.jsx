import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Bot, FileText, Calendar,
  Activity, User, ChevronLeft, ChevronRight, X,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',            to: '/patient/dashboard',    icon: LayoutDashboard },
  { label: 'AI Health Assistant',   to: '/patient/ai-bot',       icon: Bot },
  { label: 'Find a Doctor', to: '/patient/doctor-finder', icon: User },
  { label: 'Medical Records & Care', to: '/patient/records', icon: FileText },
  { label: 'Appointments', to: '/patient/appointments', icon: Calendar },
  { label: 'Health Tracker', to: '/patient/tracker', icon: Activity },
  { label: 'Profile', to: '/patient/profile', icon: User },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const isActive = (to) => location.pathname === to

  const baseLink = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200`
  const activeLink = `bg-primary-500 text-white shadow-sm`
  const inactiveLink = `text-gray-600 hover:bg-primary-50 hover:text-primary-700`

  const SidebarContent = () => (
    <div className={`flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo row */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100">
        {!collapsed && (
          <span className="text-base font-bold text-primary-700 tracking-tight">
            Doc<span className="text-primary-500">Tech</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close button */}
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-primary-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`${baseLink} ${isActive(to) ? activeLink : inactiveLink}`}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom hint */}
      {!collapsed && (
        <div className="p-3 mx-2 mb-3 rounded-xl bg-primary-50 border border-primary-100">
          <p className="text-xs text-primary-700 font-medium">🌿 Tip of the day</p>
          <p className="text-xs text-primary-600 mt-0.5">Drink at least 8 glasses of water today!</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={onClose} />
          <aside className="relative z-10 flex flex-col w-60 h-full">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
