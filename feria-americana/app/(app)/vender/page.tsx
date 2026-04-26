import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VenderClient } from './VenderClient'

export const dynamic = 'force-dynamic'

export default async function VenderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (!profile || profile.role !== 'vendedor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display text-2xl font-bold text-feria-dark mb-2">
          Modo vendedor bloqueado
        </h2>
        <p className="text-feria-muted text-sm max-w-xs">
          Para vender necesitás activar el modo vendedor desde tu perfil con el código secreto.
        </p>
      </div>
    )
  }

  const [{ data: products }, { data: owners }] = await Promise.all([
    supabase
      .from('products')
      .select('*, owner:users(*)')
      .eq('estado', 'disponible')
      .order('created_at', { ascending: false }),
    supabase.from('users').select('*').order('nombre'),
  ])

  return (
    <VenderClient
      initialProducts={products ?? []}
      owners={owners ?? []}
      currentUser={profile}
    />
  )
}
