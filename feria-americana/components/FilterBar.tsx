'use client'

import { Search, X } from 'lucide-react'
import { CATEGORIES, STATUSES, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/constants'
import type { UserProfile, ProductCategory, ProductStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface FilterState {
  search: string
  categoria: ProductCategory | ''
  estado: ProductStatus | ''
  ownerId: string
  precioMin: string
  precioMax: string
}

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  owners: UserProfile[]
  showStatusFilter?: boolean
}

export function FilterBar({ filters, onChange, owners, showStatusFilter = true }: FilterBarProps) {
  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  function clearAll() {
    onChange({ search: '', categoria: '', estado: '', ownerId: '', precioMin: '', precioMax: '' })
  }

  const hasActiveFilters = filters.search || filters.categoria || filters.estado ||
    filters.ownerId || filters.precioMin || filters.precioMax

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-feria-muted" />
        <input
          type="search"
          className="input pl-9 pr-4"
          placeholder="Buscar por título..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
        />
        {filters.search && (
          <button
            onClick={() => update('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-feria-muted"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chips row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {/* Categoría */}
        <select
          className={cn(
            'flex-shrink-0 text-sm rounded-full px-3 py-1.5 border font-medium appearance-none cursor-pointer',
            filters.categoria
              ? 'bg-feria-lavender text-white border-feria-lavender'
              : 'bg-feria-cream border-feria-border text-feria-muted'
          )}
          value={filters.categoria}
          onChange={e => update('categoria', e.target.value)}
        >
          <option value="">Categoría</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        {/* Estado */}
        {showStatusFilter && (
          <select
            className={cn(
              'flex-shrink-0 text-sm rounded-full px-3 py-1.5 border font-medium appearance-none cursor-pointer',
              filters.estado
                ? 'bg-feria-lavender text-white border-feria-lavender'
                : 'bg-feria-cream border-feria-border text-feria-muted'
            )}
            value={filters.estado}
            onChange={e => update('estado', e.target.value)}
          >
            <option value="">Estado</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        )}

        {/* Dueño */}
        <select
          className={cn(
            'flex-shrink-0 text-sm rounded-full px-3 py-1.5 border font-medium appearance-none cursor-pointer',
            filters.ownerId
              ? 'bg-feria-lavender text-white border-feria-lavender'
              : 'bg-feria-cream border-feria-border text-feria-muted'
          )}
          value={filters.ownerId}
          onChange={e => update('ownerId', e.target.value)}
        >
          <option value="">Dueño/a</option>
          {owners.map(o => (
            <option key={o.id} value={o.id}>{o.nombre}</option>
          ))}
        </select>

        {/* Precio min */}
        <input
          type="number"
          className={cn(
            'flex-shrink-0 w-28 text-sm rounded-full px-3 py-1.5 border font-medium',
            filters.precioMin
              ? 'bg-feria-lavender text-white border-feria-lavender placeholder:text-white/70'
              : 'bg-feria-cream border-feria-border text-feria-muted'
          )}
          placeholder="$ mín"
          value={filters.precioMin}
          onChange={e => update('precioMin', e.target.value)}
          min={0}
        />

        {/* Precio max */}
        <input
          type="number"
          className={cn(
            'flex-shrink-0 w-28 text-sm rounded-full px-3 py-1.5 border font-medium',
            filters.precioMax
              ? 'bg-feria-lavender text-white border-feria-lavender placeholder:text-white/70'
              : 'bg-feria-cream border-feria-border text-feria-muted'
          )}
          placeholder="$ máx"
          value={filters.precioMax}
          onChange={e => update('precioMax', e.target.value)}
          min={0}
        />

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex-shrink-0 flex items-center gap-1 text-sm rounded-full px-3 py-1.5
                       border border-red-200 bg-red-50 text-red-600 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
