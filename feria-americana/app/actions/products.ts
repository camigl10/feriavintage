'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProductStatus } from '@/lib/types'

export async function updateProductStatus(
  productId: string,
  estado: ProductStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'vendedor') {
    return { success: false, error: 'Sin permisos.' }
  }

  const { error } = await supabase
    .from('products')
    .update({ estado })
    .eq('id', productId)

  if (error) return { success: false, error: 'No se pudo actualizar el estado.' }

  revalidatePath('/inventario')
  revalidatePath('/vender')
  return { success: true }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  // Only owner can delete
  const { data: product } = await supabase
    .from('products')
    .select('owner_id, foto_url')
    .eq('id', productId)
    .single()

  if (!product || product.owner_id !== user.id) {
    return { success: false, error: 'Solo el dueño puede eliminar este producto.' }
  }

  // Delete photo from storage if exists
  if (product.foto_url) {
    const path = product.foto_url.split('/product-photos/')[1]
    if (path) {
      await supabase.storage.from('product-photos').remove([path])
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) return { success: false, error: 'No se pudo eliminar el producto.' }

  revalidatePath('/inventario')
  return { success: true }
}
