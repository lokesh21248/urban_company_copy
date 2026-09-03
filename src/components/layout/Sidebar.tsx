import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, Grid3X3, CalendarDays,
  CreditCard, MapPin, Tag, ImagePlay, Bell, Star,
  BarChart3, Settings, ShieldAlert, ChevronRight,
  Layers, Package, Puzzle,
} from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  path: string
  label: string
  icon: any
  badge?: number
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    items: [
      { path: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    ],
  },
  {
    title: 'Users',
    items: [
      { path: '/customers',  label: 'Customers',  icon: Users },
      { path: '/providers',  label: 'Providers',  icon: UserCheck },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { path: '/categories',    label: 'Categories',    icon: Grid3X3 },
      { path: '/subcategories', label: 'Subcategories', icon: Layers },
      { path: '/services',      label: 'Services',      icon: Package },
      { path: '/addons',        label: 'Add-ons',       icon: Puzzle },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/bookings',  label: 'Bookings',  icon: CalendarDays },
      { path: '/payments',  label: 'Payments',  icon: CreditCard },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { path: '/banners',   label: 'Banners',   icon: ImagePlay },
      { path: '/coupons',   label: 'Coupons',   icon: Tag },
      { path: '/areas',     label: 'Service Areas', icon: MapPin },
    ],
  },
  {
    title: 'Insights',
    items: [
      { path: '/reviews',   label: 'Reviews',   icon: Star },
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/audit',     label: 'Audit Logs', icon: ShieldAlert },
    ],
  },
  {
    items: [
      { path: '/settings',     label: 'Settings',     icon: Settings },
    ],
  },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-sidebar-bg w-64 flex-shrink-0 border-r border-sidebar-border">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">US</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Urban Services</p>
          <p className="text-sidebar-text text-xs mt-0.5">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin px-3">
        {navigation.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.title && (
              <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-heading">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      clsx('sidebar-link', isActive && 'active')
                    }
                  >
                    <item.icon size={17} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && (
                      <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-sidebar-heading text-xs">Urban Services v1.0.0</p>
        <p className="text-sidebar-heading text-xs">Phase 1 — Architecture</p>
      </div>
    </div>
  )
}
