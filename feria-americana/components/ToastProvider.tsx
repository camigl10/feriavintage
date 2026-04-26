'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToastData } from '@/lib/types'

interface ToastContextValue {
  toast: (data: Omit<ToastData, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-feria-lavender" />,
}

const styles = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-feria-border bg-feria-cream',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { ...data, id }])
    const duration = data.duration ?? 4000
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg',
              'pointer-events-auto animate-slide-up',
              styles[t.type]
            )}
          >
            <span className="flex-shrink-0 mt-0.5">{icons[t.type]}</span>
            <p className="text-sm text-feria-dark flex-1 font-medium">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-feria-muted hover:text-feria-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
