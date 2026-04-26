'use client'

import { useState } from 'react'
import { Modal } from './ui/Modal'
import { UserChip } from './UserChip'
import { formatPrice } from '@/lib/utils'
import { PAYMENT_METHODS, PAYMENT_LABELS } from '@/lib/constants'
import type { Product, PaymentMethod } from '@/lib/types'

interface SaleModalProps {
  product: Product | null
  onClose: () => void
  onConfirm: (data: {
    productId: string
    precioFinal: number
    metodoPago: PaymentMethod
    notas: string
  }) => Promise<void>
}

export function SaleModal({ product, onClose, onConfirm }: SaleModalProps) {
  const [precio, setPrecio] = useState<string>(
    product ? String(product.precio_sugerido) : ''
  )
  const [metodoPago, setMetodoPago] = useState<PaymentMethod>('efectivo')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when product changes
  if (product && precio === '' && product.precio_sugerido) {
    setPrecio(String(product.precio_sugerido))
  }

  async function handleConfirm() {
    if (!product) return
    const precioNum = parseFloat(precio)
    if (isNaN(precioNum) || precioNum <= 0) {
      setError('Ingresá un precio válido.')
      return
    }
    if (product.precio_minimo && precioNum < product.precio_minimo) {
      setError(`El precio mínimo es ${formatPrice(product.precio_minimo)}.`)
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onConfirm({
        productId: product.id,
        precioFinal: precioNum,
        metodoPago,
        notas,
      })
      // Reset state
      setPrecio('')
      setMetodoPago('efectivo')
      setNotas('')
    } catch {
      setError('No se pudo registrar la venta. Intentá de nuevo.')
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    setPrecio('')
    setMetodoPago('efectivo')
    setNotas('')
    setError(null)
    onClose()
  }

  return (
    <Modal open={!!product} onClose={handleClose} title="Registrar venta">
      {product && (
        <div className="space-y-5">
          {/* Product summary */}
          <div className="bg-feria-cream-dark rounded-xl p-4">
            <p className="font-semibold text-feria-dark text-base mb-1">{product.titulo}</p>
            {product.owner && <UserChip user={product.owner} />}
            <p className="text-feria-muted text-sm mt-1">
              Precio sugerido: <strong className="text-feria-dark">{formatPrice(product.precio_sugerido)}</strong>
              {product.precio_minimo && (
                <> · Mínimo: <strong className="text-feria-dark">{formatPrice(product.precio_minimo)}</strong></>
              )}
            </p>
          </div>

          {/* Precio final */}
          <div>
            <label className="label" htmlFor="precio-final">
              Precio final ($)
            </label>
            <input
              id="precio-final"
              type="number"
              inputMode="numeric"
              className="input text-2xl font-bold text-center"
              value={precio}
              onChange={e => { setPrecio(e.target.value); setError(null) }}
              min={0}
              step={50}
              autoFocus
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="label">Método de pago</label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setMetodoPago(method)}
                  className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-150 ${
                    metodoPago === method
                      ? 'border-feria-lavender bg-feria-lavender/10 text-feria-lavender-dark'
                      : 'border-feria-border bg-feria-cream text-feria-muted'
                  }`}
                >
                  {method === 'efectivo' ? '💵' : '📲'} {PAYMENT_LABELS[method]}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="label" htmlFor="notas">
              Notas <span className="text-feria-muted font-normal">(opcional)</span>
            </label>
            <textarea
              id="notas"
              className="input resize-none"
              placeholder="Ej: cliente volvió con el exacto"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading || !precio}
            className="btn-primary w-full text-base py-4"
          >
            {loading ? 'Registrando...' : `Confirmar venta · ${precio ? formatPrice(parseFloat(precio) || 0) : '$0'}`}
          </button>
        </div>
      )}
    </Modal>
  )
}
