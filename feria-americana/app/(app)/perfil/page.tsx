import { createClient } from '@/lib/supabase/server'
import { PerfilClient } from './PerfilClient'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <PerfilClient profile={profile!} />
}
