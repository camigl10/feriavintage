'use client'

import Image from 'next/image'
import { Tag } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { UserChip } from './UserChip'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  onSell?: (product: Product) => void
  canSell?: boolean
  className?: string
}

export function ProductCard({ product, onSell, canSell, className }: ProductCardProps) {
  const isSold = product.estado === 'vendido'
  const isAvailable = product.estado === 'disponible'

  return (
    <div
      className={cn(
        'card-paper overflow-hidden flex flex-col transition-all duration-150',
        isSold && 'opacity-60',
        className
      )}
    >
      {/* Color bar from owner */}
      {product.owner && (
        <div
          className="h-1 w-full flex-shrink-0"
          style={{ backgroundColor: product.owner.color }}
        />
      )}

      {/* Image */}
      <div className="relative aspect-square bg-feria-cream-dark flex-shrink-0 overflow-hidden">
        {product.foto_url ? (
          <Image
            src={product.foto_url}
            alt={product.titulo}
            fill
            className={cn('object-cover', isSold && 'grayscale')}
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-10 h-10 text-feria-border" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-semibold',
            STATUS_COLORS[product.estado]
          )}>
            {STATUS_LABELS[product.estado]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="font-semibold text-feria-dark text-sm leading-tight line-clamp-2">
          {product.titulo}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-feria-muted bg-feria-cream-dark rounded-full px-2 py-0.5">
            {CATEGORY_LABELS[product.categoria]}
          </span>
          {product.talle && (
            <span className="text-xs text-feria-muted bg-feria-cream-dark rounded-full px-2 py-0.5">
              T. {product.talle}
            </span>
          )}
        </div>

        {product.owner && (
          <UserChip user={product.owner} />
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-bold text-feria-dark text-base">
            {formatPrice(product.precio_sugerido)}
          </span>
          {product.precio_minimo && !isSold && (
            <span className="text-xs text-feria-muted">
              mín. {formatPrice(product.precio_minimo)}
            </span>
          )}
        </div>

        {canSell && isAvailable && onSell && (
          <button
            onClick={() => onSell(product)}
            className="btn-primary w-full mt-2 text-sm py-2.5"
          >
            Vender
          </button>
        )}
      </div>
    </div>
  )
}
