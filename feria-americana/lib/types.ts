export type UserRole = 'comprador' | 'vendedor'
export type ProductCategory = 'ropa' | 'accesorios' | 'calzado' | 'hogar' | 'otros'
export type ProductStatus = 'disponible' | 'reservado' | 'vendido'
export type PaymentMethod = 'efectivo' | 'transferencia'

export interface UserProfile {
  id: string
  nombre: string
  email: string
  color: string
  role: UserRole
  created_at: string
}

export interface Product {
  id: string
  owner_id: string
  titulo: string
  descripcion: string | null
  categoria: ProductCategory
  talle: string | null
  precio_sugerido: number
  precio_minimo: number | null
  foto_url: string | null
  estado: ProductStatus
  created_at: string
  owner?: UserProfile
}

export interface Sale {
  id: string
  product_id: string
  precio_final: number
  metodo_pago: PaymentMethod
  vendido_por: string
  notas: string | null
  created_at: string
  product?: Product & { owner?: UserProfile }
  seller?: UserProfile
}

export interface DashboardStats {
  total_recaudado: number
  total_vendidos: number
  total_disponibles: number
  total_reservados: number
  por_persona: {
    owner: UserProfile
    vendidos: number
    recaudado: number
  }[]
  top_ventas: {
    sale: Sale
    product: Product
  }[]
}

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

export interface UndoSaleData {
  saleId: string
  productId: string
  productTitulo: string
  expiresAt: number
}
