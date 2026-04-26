import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
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
        <div className="text-5xl mb-4">📊</div>
        <h2 className="font-display text-2xl font-bold text-feria-dark mb-2">
          Dashboard de vendedores
        </h2>
        <p className="text-feria-muted text-sm max-w-xs">
          Activá el modo vendedor desde tu perfil para ver las estadísticas de la feria.
        </p>
      </div>
    )
  }

  const [{ data: sales }, { data: products }, { data: owners }] = await Promise.all([
    supabase
      .from('sales')
      .select('*, product:products(*, owner:users(*)), seller:users!sales_vendido_por_fkey(*)')
      .order('created_at', { ascending: false }),
    supabase.from('products').select('*, owner:users(*)'),
    supabase.from('users').select('*').order('nombre'),
  ])

  return (
    <DashboardClient
      sales={sales ?? []}
      products={products ?? []}
      owners={owners ?? []}
    />
  )
}
