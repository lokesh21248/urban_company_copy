import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import {
  Grid3X3, Plus, Trash2, ChevronDown, ChevronRight,
  Package, X, Check, Loader2, Layers, Image as ImageIcon, Edit2
} from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

// ── Types ──────────────────────────────────────────────────────────────────

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
}

interface Subcategory {
  id: number
  name: string
  description: string
  imageUrl?: string
  isActive: boolean
  services: ServiceItem[]
}

interface Category {
  id: number
  name: string
  slug: string
  description: string
  iconUrl: string
  isActive: boolean
  sortOrder: number
  subcategories: Subcategory[]
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return active
    ? <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Active</span>
    : <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-500">Inactive</span>
}

// ── Add Category Modal ─────────────────────────────────────────────────────

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    iconUrl: '',
    sortOrder: '0',
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    mutation.mutate({
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      iconUrl: form.iconUrl.trim(),
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Home Cleaning, Repair"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Slug (Optional)
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="e.g. home-cleaning (auto-generated if blank)"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Category overview..."
            />
          </div>
          <ImageUpload
            label="Category Icon / Image"
            folder="categories"
            value={form.iconUrl}
            onChange={(url) => setForm(f => ({ ...f, iconUrl: url }))}
            helpText="Upload an image/icon or enter an image URL"
          />

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
              disabled={mutation.isPending || !form.name}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Category
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to save category. Please check backend connection.</p>
          )}
        </form>
      </div>
    </div>
  )
}

// ── Add Subcategory Modal ──────────────────────────────────────────────────

function AddSubcategoryModal({
  categoryId,
  onClose,
}: {
  categoryId: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    sortOrder: '0',
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.post('/subcategories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    mutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      categoryId,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Add Subcategory</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Kitchen Cleaning"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Subcategory description..."
            />
          </div>
          <ImageUpload
            label="Subcategory Image"
            folder="subcategories"
            value={form.imageUrl}
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
            helpText="Upload an image representing this subcategory"
          />

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
              disabled={mutation.isPending || !form.name}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Subcategory
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to save subcategory. Check console for details.</p>
          )}
        </form>
      </div>
    </div>
  )
}

// ── Add Service Modal ──────────────────────────────────────────────────────

function AddServiceModal({
  subcategoryId,
  onClose,
}: {
  subcategoryId: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '', description: '', basePrice: '', estimatedDurationMinutes: '60', imageUrl: '',
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.post('/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.basePrice) return
    mutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      basePrice: parseFloat(form.basePrice),
      estimatedDurationMinutes: parseInt(form.estimatedDurationMinutes) || 60,
      imageUrl: form.imageUrl.trim() || undefined,
      subcategoryId,
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (₹)</label>
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
              disabled={mutation.isPending || !form.name || !form.basePrice}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Service
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to save service. Check console for details.</p>
          )}
        </form>
      </div>
    </div>
  )
}

function EditCategoryModal({ category, onClose }: { category: Category, onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    iconUrl: category.iconUrl || '',
    sortOrder: category.sortOrder.toString(),
    isActive: category.isActive,
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.put(`/categories/${category.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    mutation.mutate({
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      iconUrl: form.iconUrl.trim(),
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Category</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Slug
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
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
          <ImageUpload
            label="Category Icon / Image"
            folder="categories"
            value={form.iconUrl}
            onChange={(url) => setForm(f => ({ ...f, iconUrl: url }))}
            helpText="Upload an image/icon or enter an image URL"
          />

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
              disabled={mutation.isPending || !form.name}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Update Category
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to update category.</p>
          )}
        </form>
      </div>
    </div>
  )
}

// ── Category Row ───────────────────────────────────────────────────────────

function CategoryRow({ cat }: { cat: Category }) {
  const [expanded, setExpanded] = useState(false)
  const [addServiceFor, setAddServiceFor] = useState<number | null>(null)
  const [addSubcategoryFor, setAddSubcategoryFor] = useState<number | null>(null)
  const [editCategoryFor, setEditCategoryFor] = useState<number | null>(null)

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })

  return (
    <>
      <tr
        className="hover:bg-purple-50/40 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 overflow-hidden border border-purple-200/60 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
              {cat.iconUrl ? (
                <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
              ) : (
                cat.sortOrder
              )}
            </div>
            <div>
              <div className="font-bold text-gray-900">{cat.name}</div>
              <div className="text-xs text-gray-400 font-mono">{cat.slug}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">{cat.description || '—'}</td>
        <td className="px-6 py-4">
          <StatusBadge active={cat.isActive} />
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {cat.subcategories?.length ?? 0} subcategories
        </td>
        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-2">
            <button
              title="Add Subcategory"
              onClick={() => setAddSubcategoryFor(cat.id)}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50"
            >
              <Plus size={13} /> Subcategory
            </button>
            <button
              title="Edit Category"
              onClick={() => setEditCategoryFor(cat.id)}
              className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              title="Delete Category"
              onClick={() => {
                if (window.confirm(`Delete category "${cat.name}"?`)) {
                  deleteMutation.mutate(cat.id)
                }
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronDown size={18} className="text-purple-600" /> : <ChevronRight size={18} />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded subcategories */}
      {expanded && (
        <tr className="bg-gray-50/70">
          <td colSpan={5} className="px-6 py-3">
            <div className="ml-8 border-l-2 border-purple-200 pl-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Subcategories ({cat.subcategories?.length ?? 0})
                </span>
                <button
                  onClick={() => setAddSubcategoryFor(cat.id)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-100/60"
                >
                  <Plus size={13} /> Add Subcategory
                </button>
              </div>

              {cat.subcategories && cat.subcategories.length > 0 ? (
                cat.subcategories.map(sub => (
                  <div key={sub.id} className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-purple-500" />
                        <span className="font-bold text-sm text-gray-900">{sub.name}</span>
                        <StatusBadge active={sub.isActive} />
                      </div>
                      <button
                        onClick={() => setAddServiceFor(sub.id)}
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <Plus size={12} /> Add Service
                      </button>
                    </div>

                    {sub.services && sub.services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
                        {sub.services.map(svc => (
                          <div key={svc.id} className="bg-gray-50/80 rounded-lg border border-gray-100 p-3 flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{svc.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{svc.estimatedDurationMinutes} min</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-purple-700 text-sm">₹{svc.basePrice}</div>
                              <StatusBadge active={svc.isActive} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No services yet — click "Add Service" to add bookable services.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-white/60 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">No subcategories yet.</p>
                  <button
                    onClick={() => setAddSubcategoryFor(cat.id)}
                    className="text-xs font-bold text-purple-600 hover:underline mt-1 inline-block"
                  >
                    + Add first subcategory
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {addServiceFor !== null && (
        <AddServiceModal subcategoryId={addServiceFor} onClose={() => setAddServiceFor(null)} />
      )}

      {addSubcategoryFor !== null && (
        <AddSubcategoryModal categoryId={addSubcategoryFor} onClose={() => setAddSubcategoryFor(null)} />
      )}

      {editCategoryFor !== null && (
        <EditCategoryModal category={cat} onClose={() => setEditCategoryFor(null)} />
      )}
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)

  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Services</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your service catalog — expand a category to see subcategories and services</p>
        </div>
        <button
          onClick={() => setIsAddCategoryOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load categories</p>
            <p className="text-sm mt-1 text-gray-400">Make sure the backend is running on port 8080</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Subcategories</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <Grid3X3 size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="font-medium text-gray-600">No categories in database.</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Add a category to begin building your service catalog.</p>
                    <button
                      onClick={() => setIsAddCategoryOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      <Plus size={15} /> Add Category
                    </button>
                  </td>
                </tr>
              ) : (
                categories?.map(cat => <CategoryRow key={cat.id} cat={cat} />)
              )}
            </tbody>
          </table>
        )}
      </div>

      {isAddCategoryOpen && (
        <AddCategoryModal onClose={() => setIsAddCategoryOpen(false)} />
      )}
    </div>
  )
}
