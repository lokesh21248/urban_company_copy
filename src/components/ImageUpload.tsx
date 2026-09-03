import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import apiClient from '../api/apiClient'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  aspectRatio?: 'square' | 'wide' | 'banner' | 'auto'
  required?: boolean
  helpText?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Image',
  aspectRatio = 'auto',
  required = false,
  helpText,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Only image files (PNG, JPG, WEBP, SVG, GIF) are allowed.')
      return
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data && response.data.url) {
        onChange(response.data.url)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err?.response?.data?.error || err?.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleClear = () => {
    onChange('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const previewHeightClass =
    aspectRatio === 'banner'
      ? 'h-36'
      : aspectRatio === 'wide'
      ? 'h-28'
      : aspectRatio === 'square'
      ? 'h-24 w-24'
      : 'h-28'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`font-semibold px-2 py-0.5 rounded transition ${
              mode === 'upload' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Upload File
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`font-semibold px-2 py-0.5 rounded transition ${
              mode === 'url' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Enter URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <LinkIcon size={14} />
            </div>
            <input
              type="url"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          {value && (
            <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
              <img
                src={value}
                alt="Preview"
                className={`object-contain max-h-32 rounded-lg`}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none'
                  setError('Could not load image from provided URL')
                }}
                onLoad={() => setError(null)}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white text-gray-600 hover:text-red-600 rounded-full shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            /* Uploaded Image Preview */
            <div className="relative rounded-xl border border-gray-200/80 bg-gray-50/50 p-3 overflow-hidden">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 ${previewHeightClass}`}
                >
                  <img
                    src={value}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                    <CheckCircle2 size={14} />
                    <span>Image uploaded</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate font-mono bg-white px-2 py-1 rounded border border-gray-100">
                    {value}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      Change image
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={isUploading}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-purple-500 bg-purple-50/60 scale-[0.99]'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50/50'
              } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              {isUploading ? (
                <div className="py-4 flex flex-col items-center justify-center text-purple-600">
                  <Loader2 size={24} className="animate-spin mb-2" />
                  <span className="text-xs font-semibold text-gray-700">Uploading image...</span>
                </div>
              ) : (
                <div className="py-3 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    Click to browse <span className="text-gray-400 font-normal">or drag & drop image</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WEBP, SVG or GIF up to 10MB</p>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
            onChange={onFileSelect}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50/80 px-2.5 py-1.5 rounded-lg border border-red-200">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helpText && !error && (
        <p className="text-[11px] text-gray-400">{helpText}</p>
      )}
    </div>
  )
}
