import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import {
  CalendarDays, Loader2, X, CheckCircle2, XCircle,
  Clock, PlayCircle, RefreshCw, UserCheck, MapPin
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface BookingItem {
  id: number
  serviceId: number
  serviceName: string
  price: number
  quantity: number
  totalPrice: number
}

interface Booking {
  id: number
  customerId: number
  customerName: string
  customerPhone: string
  providerId: number | null
  providerName: string | null
  providerPhone: string | null
  addressId: number
  addressText: string
  city: string
  status: string
  scheduledTime: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  cancellationReason: string | null
  createdAt: string
  items: BookingItem[]
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit"><CheckCircle2 size={11}/>Completed</span>
    case 'IN_PROGRESS': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 w-fit"><PlayCircle size={11}/>In Progress</span>
    case 'ACCEPTED': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1 w-fit"><UserCheck size={11}/>Accepted</span>
    case 'CANCELLED': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit"><XCircle size={11}/>Cancelled</span>
    default: return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit"><Clock size={11}/>Pending</span>
  }
}

// ── Booking Detail Drawer ─────────────────────────────────────────────────

function BookingDrawer({
  booking,
  onClose,
}: {
  booking: Booking
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      apiClient.put(`/bookings/${booking.id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      onClose()
    },
  })

  const transitions: Record<string, string[]> = {
    PENDING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }

  const nextStatuses = transitions[booking.status] ?? []

  const buttonStyle: Record<string, string> = {
    ACCEPTED: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    IN_PROGRESS: 'bg-blue-600 hover:bg-blue-700 text-white',
    COMPLETED: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    CANCELLED: 'border border-red-200 text-red-600 hover:bg-red-50',
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs text-gray-400 font-mono">ORDER #{booking.id}</p>
            <h3 className="text-lg font-bold text-gray-900">{booking.customerName}</h3>
            <div className="mt-1"><StatusBadge status={booking.status} /></div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        <div className="p-6 flex-1 space-y-5">
          {/* Customer */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
            <p className="text-sm font-bold text-gray-900">{booking.customerName}</p>
            <p className="text-sm text-gray-600">{booking.customerPhone}</p>
          </div>

          {/* Provider */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned Provider</p>
            {booking.providerName ? (
              <>
                <p className="text-sm font-bold text-gray-900">{booking.providerName}</p>
                <p className="text-sm text-gray-600">{booking.providerPhone}</p>
              </>
            ) : (
              <p className="text-sm text-amber-600 font-semibold">
                Unassigned — waiting for provider to accept
              </p>
            )}
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Service Address</p>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{booking.addressText}</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarDays size={14} className="text-purple-500" />
            <span className="font-semibold">Scheduled:</span>
            <span>{new Date(booking.scheduledTime).toLocaleString()}</span>
          </div>

          {/* Services ordered */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Services Ordered</p>
            <div className="space-y-2">
              {booking.items?.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-purple-50/60 border border-purple-100 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.serviceName}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-purple-700">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-purple-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{booking.totalAmount}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span className="font-semibold">-₹{booking.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-purple-200 pt-2">
              <span>Total</span>
              <span className="text-purple-700">₹{booking.finalAmount}</span>
            </div>
          </div>

          {booking.cancellationReason && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-red-500 mb-1">Cancellation Reason</p>
              <p className="text-sm text-red-800">{booking.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {nextStatuses.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-2 sticky bottom-0 bg-white">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Update Status</p>
            {nextStatuses.map(s => (
              <button
                key={s}
                onClick={() => statusMutation.mutate(s)}
                disabled={statusMutation.isPending}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${buttonStyle[s]}`}
              >
                {statusMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                Mark as {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<Booking | null>(null)
  const queryClient = useQueryClient()

  const { data: bookings, isLoading, error, isFetching } = useQuery<Booking[]>({
    queryKey: ['bookings', filter],
    queryFn: async () => {
      const params = filter !== 'ALL' ? `?status=${filter}` : ''
      const res = await apiClient.get(`/bookings${params}`)
      return res.data
    },
    refetchInterval: 10000,
  })

  const statusFilters = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live order feed — auto-refreshes every 10 seconds</p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['bookings'] })}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 text-gray-700"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin text-purple-600' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusFilters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border whitespace-nowrap transition ${filter === f
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load bookings</p>
            <p className="text-sm mt-1 text-gray-400">Make sure the backend is running on port 8080</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Scheduled</th>
                <th className="px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <CalendarDays size={40} className="mx-auto mb-3 text-gray-200" />
                    <p>No bookings found for filter: <strong>{filter}</strong></p>
                  </td>
                </tr>
              ) : (
                bookings?.map(b => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition"
                    onClick={() => setSelected(b)}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-purple-600">#{b.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{b.customerName}</div>
                      <div className="text-xs text-gray-400">{b.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {b.providerName ? (
                        <div>
                          <div className="font-semibold text-gray-900">{b.providerName}</div>
                          <div className="text-xs text-gray-400">{b.providerPhone}</div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(b.scheduledTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{b.finalAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <BookingDrawer booking={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
