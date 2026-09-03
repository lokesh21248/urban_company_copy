import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import { Plus, Package, Loader2, Grid3X3, Trash2, Edit2, X, Check } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

interface Category {
  id: number
  name: string
}

interface Subcategory {
  id: number
  categoryId: number
  categoryName: string
  name: string
  slug: string
  description: string
  imageUrl: string
  isActive: boolean
  sortOrder: number
}

function StatusBadge({ active }: { active: boolean }) {
  return active
    ? <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Active</span>
    : <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-500">Inactive</span>
}

function AddSubcategoryModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data
    }
  })

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    sortOrder: '0',
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.post('/subcategories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.categoryId) return
    mutation.mutate({
      name: form.name.trim(),
      categoryId: parseInt(form.categoryId),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
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
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="" disabled>Select a category</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
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
            />
          </div>
          <ImageUpload
            label="Subcategory Image"
            folder="subcategories"
            value={form.imageUrl}
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
            helpText="Upload an image or enter an image URL"
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
              disabled={mutation.isPending || !form.name || !form.categoryId}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Subcategory
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to save subcategory.</p>
          )}
        </form>
      </div>
    </div>
  )
}

function EditSubcategoryModal({ subcategory, onClose }: { subcategory: Subcategory, onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data
    }
  })

  const [form, setForm] = useState({
    name: subcategory.name,
    categoryId: subcategory.categoryId.toString(),
    description: subcategory.description || '',
    imageUrl: subcategory.imageUrl || '',
    sortOrder: subcategory.sortOrder.toString(),
    isActive: subcategory.isActive,
  })

  const mutation = useMutation({
    mutationFn: (data: object) => apiClient.put(`/subcategories/${subcategory.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.categoryId) return
    mutation.mutate({
      name: form.name.trim(),
      categoryId: parseInt(form.categoryId),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Subcategory</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="" disabled>Select a category</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
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
          <ImageUpload
            label="Subcategory Image"
            folder="subcategories"
            value={form.imageUrl}
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
            helpText="Upload an image or enter an image URL"
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
              disabled={mutation.isPending || !form.name || !form.categoryId}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Update Subcategory
            </button>
          </div>
          {mutation.isError && (
            <p className="text-red-600 text-xs mt-2">Failed to update subcategory.</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default function SubcategoriesPage() {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)

  const { data: subcategories, isLoading, error } = useQuery<Subcategory[]>({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const res = await apiClient.get('/subcategories')
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/subcategories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subcategories'] })
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all subcategories and their parent categories</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-sm"
        >
          <Plus size={16} /> Add Subcategory
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load subcategories</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Subcategory</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subcategories?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <Grid3X3 size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="mb-3">No subcategories found.</p>
                    <button 
                      onClick={() => setIsAddOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      <Plus size={15} /> Add Subcategory
                    </button>
                  </td>
                </tr>
              ) : (
                subcategories?.map(sub => (
                  <tr key={sub.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 overflow-hidden border border-purple-200/50 flex items-center justify-center text-purple-700 shrink-0">
                          {sub.imageUrl ? (
                            <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <Package size={18} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{sub.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{sub.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{sub.categoryName}</td>
                    <td className="px-6 py-4 text-gray-500">{sub.description || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge active={sub.isActive} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => setEditingSubcategory(sub)}
                        className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Delete ${sub.name}?`)) {
                            deleteMutation.mutate(sub.id)
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

      {isAddOpen && <AddSubcategoryModal onClose={() => setIsAddOpen(false)} />}
      {editingSubcategory && <EditSubcategoryModal subcategory={editingSubcategory} onClose={() => setEditingSubcategory(null)} />}
    </div>
  )
}
