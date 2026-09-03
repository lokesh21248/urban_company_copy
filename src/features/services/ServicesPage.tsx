import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import { Plus, Package, Loader2, Grid3X3, Trash2, Edit2, Clock, IndianRupee, X, Check } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

interface Subcategory {
  id: number
  name: string
  categoryId: number
  categoryName: string
}

interface ServiceItem {
  id: number
  name: string
  slug: string
  description: string
  basePrice: number
  estimatedDurationMinutes: number
  isActive: boolean
  subcategoryId: number
  subcategoryName: string
  imageUrl?: string
}

function StatusBadge({ active }: { active: boolean }) {
  return active
    ? <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Active</span>
    : <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-500">Inactive</span>
}

function AddServiceModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: subcategories } = useQuery<Subcategory[]>({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const res = await apiClient.get('/subcategories')
      return res.data
    }
  })

  const [form, setForm] = useState({
    name: '',
    subcategoryId: '',
    description: '',
    basePrice: '',
    estimatedDurationMinutes: '60',
    imageUrl: '',
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.post('/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.subcategoryId || !form.basePrice) return
    mutation.mutate({
      name: form.name.trim(),
      subcategoryId: parseInt(form.subcategoryId),
      description: form.description.trim(),
      basePrice: parseFloat(form.basePrice),
      estimatedDurationMinutes: parseInt(form.estimatedDurationMinutes) || 60,
      imageUrl: form.imageUrl.trim() || undefined,
      isActive: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Add New Service</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Parent Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.subcategoryId}
              onChange={e => setForm(f => ({ ...f, subcategoryId: e.target.value }))}
            >
              <option value="" disabled>Select a subcategory</option>
              {subcategories?.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.categoryName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Deep House Cleaning"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Service description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (₹) <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.basePrice}
                onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                placeholder="599"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (min)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.estimatedDurationMinutes}
                onChange={e => setForm(f => ({ ...f, estimatedDurationMinutes: e.target.value }))}
              />
            </div>
          </div>
          <ImageUpload
            label="Service Image (Optional)"
            folder="services"
            value={form.imageUrl}
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
            helpText="Upload a promotional photo for this service"
          />
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !form.name || !form.basePrice || !form.subcategoryId}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Service
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to save service.</p>
          )}
        </form>
      </div>
    </div>
  )
}

function EditServiceModal({ service, onClose }: { service: ServiceItem, onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: subcategories } = useQuery<Subcategory[]>({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const res = await apiClient.get('/subcategories')
      return res.data
    }
  })

  const [form, setForm] = useState({
    name: service.name,
    subcategoryId: service.subcategoryId.toString(),
    description: service.description || '',
    basePrice: service.basePrice.toString(),
    estimatedDurationMinutes: service.estimatedDurationMinutes.toString(),
    imageUrl: service.imageUrl || '',
    isActive: service.isActive,
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.put(`/services/${service.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.subcategoryId || !form.basePrice) return
    mutation.mutate({
      name: form.name.trim(),
      subcategoryId: parseInt(form.subcategoryId),
      description: form.description.trim(),
      basePrice: parseFloat(form.basePrice),
      estimatedDurationMinutes: parseInt(form.estimatedDurationMinutes) || 60,
      imageUrl: form.imageUrl.trim() || undefined,
      isActive: form.isActive,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Service</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Parent Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.subcategoryId}
              onChange={e => setForm(f => ({ ...f, subcategoryId: e.target.value }))}
            >
              <option value="" disabled>Select a subcategory</option>
              {subcategories?.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.categoryName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (₹) <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.basePrice}
                onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (min)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.estimatedDurationMinutes}
                onChange={e => setForm(f => ({ ...f, estimatedDurationMinutes: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <ImageUpload
                label="Service Image (Optional)"
                folder="services"
                value={form.imageUrl}
                onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                helpText="Upload a promotional photo for this service"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.isActive.toString()}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !form.name || !form.basePrice || !form.subcategoryId}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Update Service
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to update service.</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)

  const { data: services, isLoading, error } = useQuery<ServiceItem[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await apiClient.get('/services')
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] })
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage individual service items, pricing, and durations</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-sm"
        >
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load services</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Service Name</th>
                <th className="px-6 py-3">Subcategory</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <Grid3X3 size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="mb-3">No services found.</p>
                    <button 
                      onClick={() => setIsAddOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      <Plus size={15} /> Add Service
                    </button>
                  </td>
                </tr>
              ) : (
                services?.map(svc => (
                  <tr key={svc.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 overflow-hidden border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                          {svc.imageUrl ? (
                            <img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <Package size={18} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{svc.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{svc.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{svc.subcategoryName || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                        <div className="flex items-center gap-1.5"><IndianRupee size={12} className="text-purple-600" /> ₹{svc.basePrice}</div>
                        <div className="flex items-center gap-1.5"><Clock size={12} className="text-purple-600" /> {svc.estimatedDurationMinutes} mins</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={svc.isActive} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => setEditingService(svc)}
                        className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Delete ${svc.name}?`)) {
                            deleteMutation.mutate(svc.id)
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isAddOpen && <AddServiceModal onClose={() => setIsAddOpen(false)} />}
      {editingService && <EditServiceModal service={editingService} onClose={() => setEditingService(null)} />}
    </div>
  )
}
