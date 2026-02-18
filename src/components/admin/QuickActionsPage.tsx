import { Link } from 'react-router-dom'
import { CheckCircle, Users, TrendingUp, Zap } from 'lucide-react'

export function QuickActionsPage() {

  const actions = [
    {
      to: '/admin/team-allocation',
      icon: CheckCircle,
      title: 'Team Allocation',
      description: 'Assign by round',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      to: '/admin/allocation-view',
      icon: Users,
      title: 'View Allocations',
      description: 'See judge teams',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      to: '/admin/live-updates',
      icon: TrendingUp,
      title: 'Live Updates',
      description: 'Real-time scoring',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    }
  ]

  return (
    <div className="w-full px-6 lg:px-10 py-8">

      {/* SECTION CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

        {/* HEADER */}
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Quick Actions
        </h2>

        {/* SMALL CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {actions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                {/* ICON */}
                <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`size-5 ${action.iconColor}`} />
                </div>

                {/* TEXT */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          })}

        </div>

      </div>

    </div>
  )
}
