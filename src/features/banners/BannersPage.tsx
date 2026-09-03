import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import { Plus, Image as ImageIcon, Loader2, Grid3X3, Trash2, Edit2, Link as LinkIcon, X, Check } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  isActive: boolean
  sortOrder: number
}

function StatusBadge({ active }: { active: boolean }) {
  return active
    ? <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Active</span>
    : <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-500">Inactive</span>
}

function AddBannerModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: '0',
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.post('/banners', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.imageUrl.trim()) return
    mutation.mutate({
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim(),
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Add New Banner</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Title <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Diwali Special Offer"
            />
          </div>
          <ImageUpload
            label="Banner Image"
            folder="banners"
            aspectRatio="banner"
            required
            value={form.imageUrl}
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
            helpText="Upload a banner graphic or enter an image URL"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Link URL</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.linkUrl}
              onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.sortOrder}
              onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
            />
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
              disabled={mutation.isPending || !form.title || !form.imageUrl}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Banner
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to save banner.</p>
          )}
        </form>
      </div>
    </div>
  )
}

function EditBannerModal({ banner, onClose }: { banner: Banner, onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: banner.title,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl || '',
    sortOrder: banner.sortOrder.toString(),
    isActive: banner.isActive,
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.put(`/banners/${banner.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.imageUrl) return
    mutation.mutate({
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim() || undefined,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Banner</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Title <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <ImageUpload
            label="Banner Image"
            folder="banners"
            value={form.imageUrl}
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
            helpText="Upload an engaging, wide image (e.g. 1200x400)"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Destination Link (Optional)</label>
            <input
              type="url"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.linkUrl}
              onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
              />
            </div>
            <div>
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
              disabled={mutation.isPending || !form.title || !form.imageUrl}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Update Banner
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to update banner.</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default function BannersPage() {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const { data: banners, isLoading, error } = useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await apiClient.get('/banners')
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/banners/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] })
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage promotional banners for the mobile app and website</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-sm"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load banners</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Banner</th>
                <th className="px-6 py-3">Link</th>
                <th className="px-6 py-3">Sort Order</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <Grid3X3 size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="mb-3">No banners found. Add a promotional banner to get started.</p>
                    <button 
                      onClick={() => setIsAddOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      <Plus size={15} /> Add Banner
                    </button>
                  </td>
                </tr>
              ) : (
                banners?.map(banner => (
                  <tr key={banner.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center shrink-0">
                          {banner.imageUrl ? (
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="font-bold text-gray-900 truncate max-w-[200px]">{banner.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {banner.linkUrl ? (
                        <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline text-xs font-semibold">
                          <LinkIcon size={12} /> {banner.linkUrl.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">{banner.sortOrder}</td>
                    <td className="px-6 py-4">
                      <StatusBadge active={banner.isActive} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => setEditingBanner(banner)}
                        className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Delete banner "${banner.title}"?`)) {
                            deleteMutation.mutate(banner.id)
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

      {isAddOpen && <AddBannerModal onClose={() => setIsAddOpen(false)} />}
      {editingBanner && <EditBannerModal banner={editingBanner} onClose={() => setEditingBanner(null)} />}
    </div>
  )
}
