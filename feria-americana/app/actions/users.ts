'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function activateVendor(code: string): Promise<{ success: boolean; error?: string }> {
  const vendorCode = process.env.VENDOR_CODE
  if (!vendorCode || code.trim() !== vendorCode) {
    return { success: false, error: 'Código incorrecto.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  const { error } = await supabase
    .from('users')
    .update({ role: 'vendedor' })
    .eq('id', user.id)

  if (error) return { success: false, error: 'No se pudo activar el modo vendedor.' }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateProfile(data: {
  nombre: string
  color: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  const { error } = await supabase
    .from('users')
    .update({ nombre: data.nombre.trim(), color: data.color })
    .eq('id', user.id)

  if (error) return { success: false, error: 'No se pudo actualizar el perfil.' }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
