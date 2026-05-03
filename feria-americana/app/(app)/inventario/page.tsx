import { createClient } from '@/lib/supabase/server'
import { InventarioClient } from './InventarioClient'

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const profilePromise = user
    ? supabase.from('users').select('*').eq('id', user.id).single()
    : Promise.resolve({ data: null })

  const [{ data: profile }, { data: products }, { data: owners }] = await Promise.all([
    profilePromise,
    supabase.from('products').select('*, owner:users(*)').order('created_at', { ascending: false }),
    supabase.from('users').select('*').order('nombre'),
  ])

  return (
    <InventarioClient
      initialProducts={products ?? []}
      owners={owners ?? []}
      currentUser={profile}
    />
  )
}
