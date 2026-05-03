import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { ToastProvider } from '@/components/ToastProvider'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    if (!profile) redirect('/onboarding')
  }

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[#EDE9F4]">
        <main className="pb-nav">{children}</main>
        <BottomNav isLoggedIn={!!user} />
      </div>
    </ToastProvider>
  )
}
