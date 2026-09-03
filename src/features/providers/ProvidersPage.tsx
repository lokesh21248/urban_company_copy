import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import {
  UserCheck, Shield, ShieldOff, Star, Phone, Mail,
  MapPin, CheckCircle2, XCircle, Clock, Loader2, X
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface ProviderService {
  id: number
  name: string
  basePrice: number
  subcategoryName: string
}

interface Provider {
  id: number
  userId: number
  fullName: string
  email: string
  phoneNumber: string
  businessName: string
  bio: string
  rating: number
  totalReviews: number
  verificationStatus: string
  isOnline: boolean
  latitude: number
  longitude: number
  services: ProviderService[]
}

// ── Verification Badge ─────────────────────────────────────────────────────

function VerificationBadge({ status }: { status: string }) {
  switch (status) {
    case 'VERIFIED':
      return <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800"><CheckCircle2 size={11} /> Verified</span>
    case 'REJECTED':
      return <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800"><XCircle size={11} /> Rejected</span>
    default:
      return <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800"><Clock size={11} /> Pending</span>
  }
}

// ── Provider Detail Drawer ─────────────────────────────────────────────────

function ProviderDrawer({
  provider,
  onClose,
}: {
  provider: Provider
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const verifyMutation = useMutation({
    mutationFn: (status: string) =>
      apiClient.put(`/providers/${provider.id}/status`, { verificationStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{provider.fullName}</h3>
            <p className="text-sm text-gray-500">{provider.businessName || 'No business name set'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mt-0.5">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3">
            <VerificationBadge status={provider.verificationStatus} />
            <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${provider.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${provider.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {provider.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Contact info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone size={14} className="text-gray-400" />
              <span>{provider.phoneNumber}</span>
            </div>
            {provider.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={14} className="text-gray-400" />
                <span>{provider.email}</span>
              </div>
            )}
            {provider.latitude && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin size={14} className="text-gray-400" />
                <span>{provider.latitude?.toFixed(4)}, {provider.longitude?.toFixed(4)}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-900">{Number(provider.rating).toFixed(1)}</span>
            <span className="text-sm text-gray-400">({provider.totalReviews} reviews)</span>
          </div>

          {/* Bio */}
          {provider.bio && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bio</p>
              <p className="text-sm text-gray-700 leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* Offered Services */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Offered Services ({provider.services?.length ?? 0})
            </p>
            {provider.services?.length > 0 ? (
              <div className="space-y-2">
                {provider.services.map(svc => (
                  <div key={svc.id} className="flex items-center justify-between bg-purple-50/60 border border-purple-100 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                      <p className="text-xs text-gray-400">{svc.subcategoryName}</p>
                    </div>
                    <span className="text-sm font-bold text-purple-700">₹{svc.basePrice}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No services selected yet</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {provider.verificationStatus !== 'VERIFIED' && (
          <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
            <button
              onClick={() => verifyMutation.mutate('REJECTED')}
              disabled={verifyMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50"
            >
              <ShieldOff size={16} /> Reject
            </button>
            <button
              onClick={() => verifyMutation.mutate('VERIFIED')}
              disabled={verifyMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700"
            >
              {verifyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Verify Provider
            </button>
          </div>
        )}
        {provider.verificationStatus === 'VERIFIED' && (
          <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white">
            <button
              onClick={() => verifyMutation.mutate('REJECTED')}
              disabled={verifyMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50"
            >
              <ShieldOff size={16} /> Revoke Verification
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ProvidersPage() {
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<Provider | null>(null)

  const { data: providers, isLoading, error } = useQuery<Provider[]>({
    queryKey: ['providers', filter],
    queryFn: async () => {
      const params = filter !== 'ALL' ? `?verificationStatus=${filter}` : ''
      const res = await apiClient.get(`/providers${params}`)
      return res.data
    },
  })

  const filterOptions = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review, verify, and manage provider profiles and their selected services</p>
        </div>
        <div className="flex items-center gap-2">
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition ${filter === f
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load providers</p>
            <p className="text-sm mt-1 text-gray-400">Make sure the backend is running on port 8080</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Services</th>
                <th className="px-6 py-3">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {providers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <UserCheck size={40} className="mx-auto mb-3 text-gray-200" />
                    <p>No providers found for filter: <strong>{filter}</strong></p>
                  </td>
                </tr>
              ) : (
                providers?.map(p => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition"
                    onClick={() => setSelected(p)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                          {p.fullName?.[0] ?? '?'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{p.fullName}</div>
                          <div className="text-xs text-gray-400">{p.businessName || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{p.phoneNumber}</div>
                      <div className="text-xs text-gray-400">{p.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4"><VerificationBadge status={p.verificationStatus} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {Number(p.rating).toFixed(1)}
                        <span className="font-normal text-gray-400 text-xs ml-1">({p.totalReviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.services?.length ?? 0} services
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${p.isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                        {p.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <ProviderDrawer provider={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
