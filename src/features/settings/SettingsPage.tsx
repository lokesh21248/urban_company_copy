import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../api/apiClient'
import { Settings, Pencil, Check, X, Loader2, Database, Server } from 'lucide-react'

interface AppConfig {
  id: number
  configKey: string
  configValue: string
  valueType: string
  description: string
}

function ConfigRow({ config }: { config: AppConfig }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(config.configValue)

  const mutation = useMutation({
    mutationFn: (newValue: string) =>
      apiClient.put(`/config/${config.configKey}`, { value: newValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] })
      setEditing(false)
    },
  })

  return (
    <tr className="hover:bg-gray-50/60 transition">
      <td className="px-6 py-4">
        <div className="font-mono text-sm font-bold text-purple-700">{config.configKey}</div>
        <div className="text-xs text-gray-400 mt-0.5">{config.description || '—'}</div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{config.valueType}</span>
      </td>
      <td className="px-6 py-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              className="border border-purple-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0 flex-1"
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => mutation.mutate(value)}
              disabled={mutation.isPending}
              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            >
              {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button
              onClick={() => { setEditing(false); setValue(config.configValue) }}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">{config.configValue}</span>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

export default function SettingsPage() {
  const { data: configs, isLoading, error } = useQuery<AppConfig[]>({
    queryKey: ['configs'],
    queryFn: async () => {
      const res = await apiClient.get('/config')
      return res.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage live platform configuration stored in MySQL — click a value to edit inline</p>
      </div>

      {/* System info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Database size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Database</p>
            <p className="text-sm font-bold text-gray-900">urban_services_db</p>
            <p className="text-xs text-emerald-600 font-semibold">● Connected (MySQL 8.0 @ localhost:3306)</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Server size={22} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Backend API</p>
            <p className="text-sm font-bold text-gray-900">Spring Boot 3.3</p>
            <p className="text-xs text-purple-600 font-semibold">● Running @ localhost:8080</p>
          </div>
        </div>
      </div>

      {/* Config table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">App Config (app_config table)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Live configuration values from the database. Changes take effect immediately.</p>
        </div>

        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            <p className="font-semibold">Failed to load configuration</p>
            <p className="text-sm mt-1 text-gray-400">Make sure the backend is running on port 8080</p>
          </div>
        ) : !configs?.length ? (
          <div className="p-16 text-center text-gray-400">
            <Settings size={40} className="mx-auto mb-3 text-gray-200" />
            <p>No configuration entries found.</p>
            <p className="text-xs mt-1">Run the seed_data.sql to populate app_config table.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Config Key</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {configs.map(c => <ConfigRow key={c.id} config={c} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
