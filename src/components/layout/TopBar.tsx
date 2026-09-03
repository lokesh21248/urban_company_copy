import { Bell, Search, ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'

// Map route → page title
const titles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/customers':    'Customers',
  '/providers':    'Providers',
  '/categories':   'Categories',
  '/subcategories':'Subcategories',
  '/services':     'Services',
  '/addons':       'Add-ons',
  '/bookings':     'Bookings',
  '/payments':     'Payments',
  '/banners':      'Banners',
  '/coupons':      'Coupons',
  '/areas':        'Service Areas',
  '/reviews':      'Reviews',
  '/analytics':    'Analytics',
  '/audit':        'Audit Logs',
  '/settings':     'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Urban Services'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-gray-900 flex-1">{title}</h1>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-3 text-gray-400 pointer-events-none" size={16} />
        <input
          type="text"
          placeholder="Search..."
          className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     w-64 text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Bell size={20} className="text-gray-600" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* Admin user */}
      <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-semibold">A</span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-900 leading-none">Admin</p>
          <p className="text-xs text-gray-500 mt-0.5">Super Admin</p>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </header>
  )
}
