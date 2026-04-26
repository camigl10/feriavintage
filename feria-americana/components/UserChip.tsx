import { cn } from '@/lib/utils'
import type { UserProfile } from '@/lib/types'

interface UserChipProps {
  user: UserProfile
  size?: 'sm' | 'md'
  className?: string
}

export function UserChip({ user, size = 'sm', className }: UserChipProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-full flex-shrink-0',
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
        )}
        style={{ backgroundColor: user.color }}
      />
      <span className={cn(
        'font-medium text-feria-dark truncate',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {user.nombre}
      </span>
    </div>
  )
}

interface UserDotProps {
  color: string
  size?: 'sm' | 'md' | 'lg'
}

export function UserDot({ color, size = 'md' }: UserDotProps) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' }
  return (
    <div
      className={cn('rounded-full flex-shrink-0', sizes[size])}
      style={{ backgroundColor: color }}
    />
  )
}
