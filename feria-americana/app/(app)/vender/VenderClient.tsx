'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import { SaleModal } from '@/components/SaleModal'
import { UndoToast } from '@/components/UndoToast'
import { useToast } from '@/components/ToastProvider'
import { UserChip } from '@/components/UserChip'
import { createSale, undoSale } from '@/app/actions/sales'
import { formatPrice } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Product, UserProfile, UndoSaleData, PaymentMethod } from '@/lib/types'

interface VenderClientProps {
  initialProducts: Product[]
  owners: UserProfile[]
  currentUser: UserProfile
}

export function VenderClient({ initialProducts, owners, currentUser }: VenderClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [pendingUndo, setPendingUndo] = useState<UndoSaleData | null>(null)

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.titulo.toLowerCase().includes(q)) return false
      }
      if (ownerId && p.owner_id !== ownerId) return false
      return true
    })
  }, [products, search, ownerId])

  async function handleSell(data: {
    productId: string
    precioFinal: number
    metodoPago: PaymentMethod
    notas: string
  }) {
    // Optimistic remove from view (it's no longer "disponible")
    const product = products.find(p => p.id === data.productId)
    setProducts(prev => prev.filter(p => p.id !== data.productId))
    setSelectedProduct(null)

    const result = await createSale(data)

    if (!result.success || !result.saleId) {
      setProducts(prev => product ? [...prev, product] : prev)
      toast({ type: 'error', message: result.error ?? 'Error al registrar la venta.' })
      return
    }

    setPendingUndo({
      saleId: result.saleId,
      productId: data.productId,
      productTitulo: product?.titulo ?? 'Producto',
      expiresAt: Date.now() + 8000,
    })
  }

  async function handleUndo(saleId: string, productId: string) {
    setPendingUndo(null)
    const result = await undoSale(saleId, productId)
    if (!result.success) {
      toast({ type: 'error', message: 'No se pudo deshacer.' })
    } else {
      toast({ type: 'info', message: 'Venta deshecha.' })
      router.refresh()
    }
  }

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="page-header">Vender</h1>
        <p className="text-feria-muted text-sm mt-0.5">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Quick search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-feria-muted" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-feria-muted" />
            </button>
          )}
        </div>

        <select
          className="input w-auto pr-8 appearance-none text-sm"
          value={ownerId}
          onChange={e => setOwnerId(e.target.value)}
        >
          <option value="">Todos</option>
          {owners.map(o => (
            <option key={o.id} value={o.id}>{o.nombre}</option>
          ))}
        </select>
      </div>

      {/* Product list — bigger cards for quick sell */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-feria-border mb-3" />
          <p className="font-semibold text-feria-dark">
            {products.length === 0 ? '¡Todo vendido! 🎉' : 'Sin resultados'}
          </p>
          <p className="text-feria-muted text-sm mt-1">
            {products.length === 0
              ? 'No quedan productos disponibles.'
              : 'Probá con otra búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => (
            <VenderCard
              key={product.id}
              product={product}
              onSell={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      <SaleModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={handleSell}
      />

      <UndoToast
        data={pendingUndo}
        onUndo={handleUndo}
        onExpire={() => setPendingUndo(null)}
      />
    </div>
  )
}

function VenderCard({ product, onSell }: { product: Product; onSell: () => void }) {
  return (
    <div className="card-paper overflow-hidden flex gap-3">
      {/* Color strip */}
      {product.owner && (
        <div
          className="w-1.5 flex-shrink-0 rounded-l-2xl"
          style={{ backgroundColor: product.owner.color }}
        />
      )}

      {/* Photo */}
      <div className="w-20 h-20 flex-shrink-0 self-center rounded-xl overflow-hidden bg-feria-cream-dark my-3">
        {product.foto_url ? (
          <Image
            src={product.foto_url}
            alt={product.titulo}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-feria-border" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 py-3 pr-3 flex flex-col justify-between min-w-0">
        <div>
          <p className="font-semibold text-feria-dark text-sm leading-tight line-clamp-2">
            {product.titulo}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-feria-muted">{CATEGORY_LABELS[product.categoria]}</span>
            {product.talle && <span className="text-xs text-feria-muted">T. {product.talle}</span>}
          </div>
          {product.owner && <UserChip user={product.owner} className="mt-1" />}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-feria-dark">{formatPrice(product.precio_sugerido)}</span>
          <button
            onClick={onSell}
            className="bg-feria-lavender text-white text-sm font-semibold rounded-xl px-4 py-2
                       active:scale-95 transition-transform"
          >
            Vender
          </button>
        </div>
      </div>
    </div>
  )
}
