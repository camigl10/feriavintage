'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PaymentMethod } from '@/lib/types'

export async function createSale(data: {
  productId: string
  precioFinal: number
  metodoPago: PaymentMethod
  notas: string
}): Promise<{ success: boolean; saleId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  // Check vendor role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'vendedor') {
    return { success: false, error: 'Solo los vendedores pueden registrar ventas.' }
  }

  // Check product is still available
  const { data: product } = await supabase
    .from('products')
    .select('estado')
    .eq('id', data.productId)
    .single()

  if (!product || product.estado !== 'disponible') {
    return { success: false, error: 'Este producto ya no está disponible.' }
  }

  // Create sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      product_id: data.productId,
      precio_final: data.precioFinal,
      metodo_pago: data.metodoPago,
      vendido_por: user.id,
      notas: data.notas || null,
    })
    .select('id')
    .single()

  if (saleError) return { success: false, error: 'No se pudo registrar la venta.' }

  // Mark product as sold
  await supabase
    .from('products')
    .update({ estado: 'vendido' })
    .eq('id', data.productId)

  revalidatePath('/inventario')
  revalidatePath('/vender')
  revalidatePath('/dashboard')

  return { success: true, saleId: sale.id }
}

export async function undoSale(saleId: string, productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .eq('id', saleId)

  if (deleteError) return { success: false, error: 'No se pudo deshacer la venta.' }

  await supabase
    .from('products')
    .update({ estado: 'disponible' })
    .eq('id', productId)

  revalidatePath('/inventario')
  revalidatePath('/vender')
  revalidatePath('/dashboard')

  return { success: true }
}
