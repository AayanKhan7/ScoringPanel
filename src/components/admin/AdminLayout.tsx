import { Link, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Zap,
  UserCog,
  Calculator,
  Download,
  LogOut,
} from 'lucide-react'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
  onLogout?: () => void
}

interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/quick-actions', label: 'Quick Actions', icon: Zap },
  { path: '/admin/judge-management', label: 'Judge Management', icon: UserCog },
  { path: '/admin/result-calculation', label: 'Result Calculation', icon: Calculator },
  { path: '/admin/export-results', label: 'Export Results', icon: Download },
]

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('current_user')
    if (onLogout) {
      onLogout()
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">

        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">
            Admin Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pitch Perfect 2026
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-md
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                <Icon
                  className={`size-5 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                       bg-red-600 hover:bg-red-700 text-black font-semibold
                       transition-all shadow-md hover:shadow-lg"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  )
}