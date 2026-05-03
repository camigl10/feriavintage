'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, ShoppingBag, BarChart3, User, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const authNavItems = [
  { href: '/inventario', label: 'Inventario', icon: LayoutGrid },
  { href: '/vender', label: 'Vender', icon: ShoppingBag },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/perfil', label: 'Perfil', icon: User },
]

const publicNavItems = [
  { href: '/inventario', label: 'Inventario', icon: LayoutGrid },
]

interface BottomNavProps {
  isLoggedIn?: boolean
}

export function BottomNav({ isLoggedIn = false }: BottomNavProps) {
  const pathname = usePathname()
  const navItems = isLoggedIn ? authNavItems : publicNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-feria-cream border-t border-feria-border">
      <div className="flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px]',
                'transition-colors duration-150',
                active ? 'text-feria-lavender' : 'text-feria-muted'
              )}
            >
              <div className={cn(
                'relative p-1.5 rounded-xl transition-all duration-150',
                active && 'bg-feria-lavender/10'
              )}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={cn(
                'text-[10px] font-medium leading-none',
                active ? 'text-feria-lavender' : 'text-feria-muted'
              )}>
                {label}
              </span>
            </Link>
          )
        })}

        {!isLoggedIn && (
          <Link
            href="/login"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-feria-lavender"
          >
            <div className="p-1.5 rounded-xl bg-feria-lavender/10">
              <LogIn className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium leading-none">Ingresar</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
