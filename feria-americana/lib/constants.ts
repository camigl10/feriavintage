import type { ProductCategory, ProductStatus, PaymentMethod } from './types'

export const USER_COLORS = [
  { value: '#E07060', label: 'Coral' },
  { value: '#6B9E7A', label: 'Sage' },
  { value: '#D4A853', label: 'Golden' },
  { value: '#5B8DB8', label: 'Sky' },
  { value: '#C96B8A', label: 'Rose' },
  { value: '#4CA99B', label: 'Mint' },
  { value: '#C4793A', label: 'Terra' },
  { value: '#8B5E9E', label: 'Plum' },
] as const

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ropa: 'Ropa',
  accesorios: 'Accesorios',
  calzado: 'Calzado',
  hogar: 'Hogar',
  otros: 'Otros',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
}

export const STATUS_COLORS: Record<ProductStatus, string> = {
  disponible: 'bg-emerald-100 text-emerald-800',
  reservado: 'bg-amber-100 text-amber-800',
  vendido: 'bg-slate-100 text-slate-600',
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
}

export const CATEGORIES: ProductCategory[] = ['ropa', 'accesorios', 'calzado', 'hogar', 'otros']
export const STATUSES: ProductStatus[] = ['disponible', 'reservado', 'vendido']
export const PAYMENT_METHODS: PaymentMethod[] = ['efectivo', 'transferencia']

export const UNDO_TIMEOUT_MS = 8000
