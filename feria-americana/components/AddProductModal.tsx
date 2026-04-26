'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, X } from 'lucide-react'
import { Modal } from './ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants'
import type { ProductCategory } from '@/lib/types'

interface AddProductModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

interface FormState {
  titulo: string
  descripcion: string
  categoria: ProductCategory
  talle: string
  precio_sugerido: string
  precio_minimo: string
}

export function AddProductModal({ open, onClose, onSuccess, userId }: AddProductModalProps) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    titulo: '',
    descripcion: '',
    categoria: 'ropa',
    talle: '',
    precio_sugerido: '',
    precio_minimo: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('La foto debe pesar menos de 5MB.')
      return
    }
    setPhoto(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    setError(null)
  }

  function removePhoto() {
    setPhoto(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!photo) return null
    const ext = photo.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('product-photos').upload(path, photo, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw new Error('Error al subir la foto.')
    const { data } = supabase.storage.from('product-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('El título es obligatorio.'); return }
    if (!form.precio_sugerido || parseFloat(form.precio_sugerido) <= 0) {
      setError('El precio sugerido debe ser mayor a $0.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const foto_url = await uploadPhoto()

      const { error } = await supabase.from('products').insert({
        owner_id: userId,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria,
        talle: form.talle.trim() || null,
        precio_sugerido: parseFloat(form.precio_sugerido),
        precio_minimo: form.precio_minimo ? parseFloat(form.precio_minimo) : null,
        foto_url,
        estado: 'disponible',
      })

      if (error) throw error

      // Reset
      setForm({ titulo: '', descripcion: '', categoria: 'ropa', talle: '', precio_sugerido: '', precio_minimo: '' })
      removePhoto()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar producto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo upload */}
        <div>
          <label className="label">Foto <span className="text-feria-muted font-normal">(opcional)</span></label>
          {photoPreview ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-feria-cream-dark">
              <Image src={photoPreview} alt="Preview" fill className="object-cover" sizes="100vw" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center
                           justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-feria-border
                         bg-feria-cream-dark flex flex-col items-center justify-center gap-2
                         text-feria-muted active:bg-feria-cream transition-colors"
            >
              <Camera className="w-8 h-8" />
              <span className="text-sm font-medium">Tocar para agregar foto</span>
              <span className="text-xs">JPG, PNG · máx. 5MB</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
            capture="environment"
          />
        </div>

        {/* Título */}
        <div>
          <label className="label" htmlFor="titulo">Título *</label>
          <input
            id="titulo"
            type="text"
            className="input"
            placeholder="Ej: Vestido floral talle M"
            value={form.titulo}
            onChange={e => update('titulo', e.target.value)}
            required
            maxLength={100}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="label" htmlFor="desc">
            Descripción <span className="text-feria-muted font-normal">(opcional)</span>
          </label>
          <textarea
            id="desc"
            className="input resize-none"
            placeholder="Material, estado, detalles..."
            value={form.descripcion}
            onChange={e => update('descripcion', e.target.value)}
            rows={2}
            maxLength={300}
          />
        </div>

        {/* Categoría + Talle */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="cat">Categoría *</label>
            <select
              id="cat"
              className="input appearance-none"
              value={form.categoria}
              onChange={e => update('categoria', e.target.value)}
              required
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="talle">
              Talle <span className="text-feria-muted font-normal">(opc.)</span>
            </label>
            <input
              id="talle"
              type="text"
              className="input"
              placeholder="S, M, 38..."
              value={form.talle}
              onChange={e => update('talle', e.target.value)}
              maxLength={10}
            />
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="precio-sug">Precio sugerido ($) *</label>
            <input
              id="precio-sug"
              type="number"
              inputMode="numeric"
              className="input"
              placeholder="1500"
              value={form.precio_sugerido}
              onChange={e => update('precio_sugerido', e.target.value)}
              required
              min={0}
              step={50}
            />
          </div>
          <div>
            <label className="label" htmlFor="precio-min">
              Precio mínimo ($) <span className="text-feria-muted font-normal">(opc.)</span>
            </label>
            <input
              id="precio-min"
              type="number"
              inputMode="numeric"
              className="input"
              placeholder="1000"
              value={form.precio_minimo}
              onChange={e => update('precio_minimo', e.target.value)}
              min={0}
              step={50}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Agregar producto'}
        </button>
      </form>
    </Modal>
  )
}
