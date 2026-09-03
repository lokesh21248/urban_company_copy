import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import {
  Users, Loader2, X, Phone, Mail, MapPin,
  IndianRupee, CalendarDays, TrendingUp
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface Address {
  id: number
  addressLine1: string
  city: string
  state: string
  postalCode: string
  label: string
  isDefault: boolean
}

interface Customer {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  status: string
  createdAt: string
  totalBookings: number
  totalSpent: number
  addresses: Address[]
}

// ── Customer Drawer ────────────────────────────────────────────────────────

function CustomerDrawer({
  customer,
  onClose,
}: {
  customer: Customer
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
              {customer.fullName?.[0] ?? '?'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{customer.fullName}</h3>
              <p className={`text-xs font-semibold ${customer.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-500'}`}>
                {customer.status}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        <div className="p-6 flex-1 space-y-5">
          {/* Contact */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone size={13} className="text-gray-400" />
              <span>{customer.phoneNumber}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={13} className="text-gray-400" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CalendarDays size={13} className="text-gray-400" />
              <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <CalendarDays size={20} className="mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-extrabold text-gray-900">{customer.totalBookings}</p>
              <p className="text-xs text-gray-500">Total Bookings</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 text-center">
              <IndianRupee size={20} className="mx-auto text-emerald-500 mb-1" />
              <p className="text-2xl font-extrabold text-gray-900">₹{Number(customer.totalSpent).toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Saved Addresses</p>
              <div className="space-y-2">
                {customer.addresses.map(addr => (
                  <div key={addr.id} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                    <MapPin size={13} className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5">{addr.addressLine1}</p>
                      <p className="text-xs text-gray-400">{addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)

  const { data: customers, isLoading, error } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/customers')
      return res.data
    },
  })

  const filtered = customers?.filter(c =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const totalSpent = customers?.reduce((sum, c) => sum + Number(c.totalSpent ?? 0), 0) ?? 0
  const totalBookings = customers?.reduce((sum, c) => sum + (c.totalBookings ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">View all registered customers, their booking history, and addresses</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Users size={20} className="text-purple-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Customers</p>
            <p className="text-xl font-extrabold text-gray-900">{customers?.length ?? 0}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><IndianRupee size={20} className="text-emerald-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Lifetime Spend</p>
            <p className="text-xl font-extrabold text-gray-900">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><TrendingUp size={20} className="text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Bookings Placed</p>
            <p className="text-xl font-extrabold text-gray-900">{totalBookings}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load customers</p>
            <p className="text-sm mt-1 text-gray-400">Make sure the backend is running on port 8080</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Bookings</th>
                <th className="px-6 py-3">Total Spent</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Users size={40} className="mx-auto mb-3 text-gray-200" />
                    <p>{search ? `No customers match "${search}"` : 'No customers in database yet'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition"
                    onClick={() => setSelected(c)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                          {c.fullName?.[0] ?? '?'}
                        </div>
                        <span className="font-bold text-gray-900">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{c.phoneNumber}</div>
                      <div className="text-xs text-gray-400">{c.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{c.totalBookings}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{Number(c.totalSpent).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
