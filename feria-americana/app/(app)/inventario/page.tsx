import { createClient } from '@/lib/supabase/server'
import { InventarioClient } from './InventarioClient'

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: products }, { data: owners }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase
      .from('products')
      .select('*, owner:users(*)')
      .order('created_at', { ascending: false }),
    supabase.from('users').select('*').order('nombre'),
  ])

  return (
    <InventarioClient
      initialProducts={products ?? []}
      owners={owners ?? []}
      currentUser={profile!}
    />
  )
}
