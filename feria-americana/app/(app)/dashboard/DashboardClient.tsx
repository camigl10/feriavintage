'use client'

import { Download, TrendingUp, Package, Users, ShoppingBag } from 'lucide-react'
import { formatPrice, formatDateShort, buildCSV, downloadCSV } from '@/lib/utils'
import { CATEGORY_LABELS, PAYMENT_LABELS } from '@/lib/constants'
import { UserDot } from '@/components/UserChip'
import type { Sale, Product, UserProfile } from '@/lib/types'

interface DashboardClientProps {
  sales: Sale[]
  products: Product[]
  owners: UserProfile[]
}

export function DashboardClient({ sales, products, owners }: DashboardClientProps) {
  const totalRecaudado = sales.reduce((acc, s) => acc + s.precio_final, 0)
  const vendidos = products.filter(p => p.estado === 'vendido').length
  const disponibles = products.filter(p => p.estado === 'disponible').length
  const reservados = products.filter(p => p.estado === 'reservado').length

  // Per-person stats
  const porPersona = owners.map(owner => {
    const ownedSales = sales.filter(s => {
      const product = s.product as Product & { owner?: UserProfile }
      return product?.owner?.id === owner.id
    })
    return {
      owner,
      vendidos: ownedSales.length,
      recaudado: ownedSales.reduce((acc, s) => acc + s.precio_final, 0),
    }
  }).filter(p => p.vendidos > 0)
    .sort((a, b) => b.recaudado - a.recaudado)

  // Top 5 sales by amount
  const topVentas = [...sales]
    .sort((a, b) => b.precio_final - a.precio_final)
    .slice(0, 5)

  function exportSalesCSV() {
    const headers = ['Fecha', 'Producto', 'Categoría', 'Dueño/a', 'Precio Final', 'Método de Pago', 'Vendido por', 'Notas']
    const rows = sales.map(s => {
      const product = s.product as Product & { owner?: UserProfile }
      return [
        formatDateShort(s.created_at),
        product?.titulo ?? '',
        product ? CATEGORY_LABELS[product.categoria] : '',
        product?.owner?.nombre ?? '',
        String(s.precio_final),
        PAYMENT_LABELS[s.metodo_pago],
        (s.seller as UserProfile)?.nombre ?? '',
        s.notas ?? '',
      ]
    })
    downloadCSV(buildCSV([headers, ...rows]), `feria-ventas-${new Date().toISOString().split('T')[0]}.csv`)
  }

  function exportInventoryCSV() {
    const headers = ['Título', 'Categoría', 'Talle', 'Dueño/a', 'Precio Sugerido', 'Precio Mínimo', 'Estado', 'Fecha']
    const rows = products.map(p => {
      const owner = p.owner as UserProfile
      return [
        p.titulo,
        CATEGORY_LABELS[p.categoria],
        p.talle ?? '',
        owner?.nombre ?? '',
        String(p.precio_sugerido),
        p.precio_minimo ? String(p.precio_minimo) : '',
        p.estado,
        formatDateShort(p.created_at),
      ]
    })
    downloadCSV(buildCSV([headers, ...rows]), `feria-inventario-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Dashboard</h1>
      </div>

      {/* Total recaudado */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #6B65A8 0%, #9590C8 100%)' }}
      >
        <p className="text-white/70 text-sm font-medium mb-1">Total recaudado</p>
        <p className="font-display text-4xl font-bold">{formatPrice(totalRecaudado)}</p>
        <p className="text-white/60 text-sm mt-2">{sales.length} venta{sales.length !== 1 ? 's' : ''} registrada{sales.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<ShoppingBag className="w-4 h-4" />} label="Vendidos" value={vendidos} color="emerald" />
        <StatCard icon={<Package className="w-4 h-4" />} label="Disponibles" value={disponibles} color="lavender" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Reservados" value={reservados} color="amber" />
      </div>

      {/* Por persona */}
      {porPersona.length > 0 && (
        <div className="card-paper p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-feria-muted" />
            <h2 className="font-semibold text-feria-dark text-sm">Por persona</h2>
          </div>
          <div className="space-y-3">
            {porPersona.map(({ owner, vendidos: v, recaudado }) => (
              <div key={owner.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <UserDot color={owner.color} />
                    <span className="text-sm font-medium text-feria-dark">{owner.nombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-feria-dark text-sm">{formatPrice(recaudado)}</span>
                    <span className="text-feria-muted text-xs ml-1.5">({v} vta{v !== 1 ? 's' : ''})</span>
                  </div>
                </div>
                {totalRecaudado > 0 && (
                  <div className="h-1.5 bg-feria-cream-dark rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(recaudado / totalRecaudado) * 100}%`,
                        backgroundColor: owner.color,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top ventas */}
      {topVentas.length > 0 && (
        <div className="card-paper p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-feria-muted" />
            <h2 className="font-semibold text-feria-dark text-sm">Top ventas</h2>
          </div>
          <div className="space-y-2">
            {topVentas.map((sale, i) => {
              const product = sale.product as Product & { owner?: UserProfile }
              return (
                <div key={sale.id} className="flex items-center gap-3">
                  <span className="text-feria-muted text-sm w-4 flex-shrink-0 font-medium">#{i + 1}</span>
                  {product?.owner && <UserDot color={product.owner.color} size="sm" />}
                  <span className="text-sm text-feria-dark flex-1 truncate min-w-0">
                    {product?.titulo ?? 'Producto'}
                  </span>
                  <span className="font-bold text-feria-dark text-sm flex-shrink-0">
                    {formatPrice(sale.precio_final)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ventas recientes */}
      {sales.length > 0 && (
        <div className="card-paper p-4">
          <h2 className="font-semibold text-feria-dark text-sm mb-3">Ventas recientes</h2>
          <div className="space-y-2.5">
            {sales.slice(0, 10).map(sale => {
              const product = sale.product as Product & { owner?: UserProfile }
              return (
                <div key={sale.id} className="flex items-start gap-3">
                  {product?.owner && <UserDot color={product.owner.color} size="sm" className="mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-feria-dark truncate">{product?.titulo}</p>
                    <p className="text-xs text-feria-muted">
                      {PAYMENT_LABELS[sale.metodo_pago]} · {formatDateShort(sale.created_at)}
                    </p>
                  </div>
                  <span className="font-bold text-feria-dark text-sm flex-shrink-0">
                    {formatPrice(sale.precio_final)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Export buttons */}
      <div className="space-y-2">
        <h2 className="font-semibold text-feria-dark text-sm px-1">Exportar</h2>
        <button
          onClick={exportSalesCSV}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Ventas como CSV
        </button>
        <button
          onClick={exportInventoryCSV}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Inventario como CSV
        </button>
      </div>

      {sales.length === 0 && (
        <div className="text-center py-8 text-feria-muted text-sm">
          Todavía no hay ventas registradas. ¡Que arranque la feria! 🛍️
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'emerald' | 'lavender' | 'amber'
}) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700',
    lavender: 'bg-feria-lavender/10 text-feria-lavender-dark',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="card-paper p-3 flex flex-col gap-1">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles[color]}`}>
        {icon}
      </div>
      <p className="font-bold text-feria-dark text-xl leading-none mt-1">{value}</p>
      <p className="text-feria-muted text-xs">{label}</p>
    </div>
  )
}
