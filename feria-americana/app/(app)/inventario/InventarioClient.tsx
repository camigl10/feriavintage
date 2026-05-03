'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Package, LogIn } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { FilterBar, type FilterState } from '@/components/FilterBar'
import { AddProductModal } from '@/components/AddProductModal'
import { SaleModal } from '@/components/SaleModal'
import { UndoToast } from '@/components/UndoToast'
import { useToast } from '@/components/ToastProvider'
import { createSale, undoSale } from '@/app/actions/sales'
import type { Product, UserProfile, UndoSaleData, PaymentMethod } from '@/lib/types'

interface InventarioClientProps {
  initialProducts: Product[]
  owners: UserProfile[]
  currentUser: UserProfile | null
}

export function InventarioClient({ initialProducts, owners, currentUser }: InventarioClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isVendedor = currentUser?.role === 'vendedor'

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filters, setFilters] = useState<FilterState>({
    search: '', categoria: '', estado: '', ownerId: '', precioMin: '', precioMax: '',
  })
  const [addOpen, setAddOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [pendingUndo, setPendingUndo] = useState<UndoSaleData | null>(null)

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!p.titulo.toLowerCase().includes(q)) return false
      }
      if (filters.categoria && p.categoria !== filters.categoria) return false
      if (filters.estado && p.estado !== filters.estado) return false
      if (filters.ownerId && p.owner_id !== filters.ownerId) return false
      if (filters.precioMin && p.precio_sugerido < parseFloat(filters.precioMin)) return false
      if (filters.precioMax && p.precio_sugerido > parseFloat(filters.precioMax)) return false
      return true
    })
  }, [products, filters])

  async function handleSell(data: {
    productId: string
    precioFinal: number
    metodoPago: PaymentMethod
    notas: string
  }) {
    setProducts(prev => prev.map(p =>
      p.id === data.productId ? { ...p, estado: 'vendido' } : p
    ))
    setSelectedProduct(null)

    const result = await createSale(data)

    if (!result.success || !result.saleId) {
      setProducts(prev => prev.map(p =>
        p.id === data.productId ? { ...p, estado: 'disponible' } : p
      ))
      toast({ type: 'error', message: result.error ?? 'Error al registrar la venta.' })
      return
    }

    const product = products.find(p => p.id === data.productId)
    setPendingUndo({
      saleId: result.saleId,
      productId: data.productId,
      productTitulo: product?.titulo ?? 'Producto',
      expiresAt: Date.now() + 8000,
    })
  }

  async function handleUndo(saleId: string, productId: string) {
    setPendingUndo(null)
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, estado: 'disponible' } : p
    ))
    const result = await undoSale(saleId, productId)
    if (!result.success) {
      toast({ type: 'error', message: 'No se pudo deshacer.' })
      router.refresh()
    } else {
      toast({ type: 'info', message: 'Venta deshecha.' })
    }
  }

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Inventario</h1>
          <p className="text-feria-muted text-sm mt-0.5">
            {filtered.length} de {products.length} productos
          </p>
        </div>
        {!currentUser && (
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-feria-lavender text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Ingresar
          </Link>
        )}
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} owners={owners} />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-feria-border mb-3" />
          <p className="font-semibold text-feria-dark">Sin resultados</p>
          <p className="text-feria-muted text-sm mt-1">
            {products.length === 0 ? 'Todavía no hay productos cargados.' : 'Probá cambiando los filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              canSell={isVendedor}
              onSell={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* FAB — add product (vendors only) */}
      {isVendedor && (
        <button
          onClick={() => setAddOpen(true)}
          className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-feria-lavender
                     text-white shadow-xl flex items-center justify-center
                     active:scale-90 transition-transform duration-150"
          style={{ boxShadow: '0 4px 20px rgba(149, 144, 200, 0.5)' }}
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}

      {/* Modals */}
      {currentUser && (
        <AddProductModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => router.refresh()}
          userId={currentUser.id}
        />
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
