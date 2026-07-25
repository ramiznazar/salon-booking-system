import { useRef, useState } from 'react'
import api from '../api/axios'

const API_ORIGIN = new URL(api.defaults.baseURL).origin

function resolveImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url)
      const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
      if (isLocalHost && parsed.pathname.startsWith('/storage/') && parsed.origin !== API_ORIGIN) {
        return `${API_ORIGIN}${parsed.pathname}`
      }
    } catch {
      return url
    }
    return url
  }
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function ImageUpload({ value, onChange, label = 'Image' }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data.data?.url || res.data.url
      onChange(url)
      setPreview(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const displaySrc = preview || resolveImageUrl(value) || null

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        {displaySrc ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={displaySrc}
              alt="preview"
              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              style={{ opacity: uploading ? 0.5 : 1, transition: 'opacity 0.2s' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 12,
              }}>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-lg border-0 cursor-pointer transition-colors"
          >
            {uploading ? 'Uploading…' : value ? 'Change Image' : 'Upload Image'}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => { onChange(''); setPreview(null) }}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border-0 cursor-pointer transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
