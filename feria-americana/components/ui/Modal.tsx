'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'relative w-full sm:max-w-md bg-feria-cream rounded-t-3xl sm:rounded-2xl',
          'shadow-2xl animate-slide-up sm:animate-bounce-in',
          'max-h-[90dvh] flex flex-col',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
            <h2 className="font-display text-2xl font-semibold text-feria-dark">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-feria-cream-dark flex items-center justify-center
                         text-feria-muted hover:text-feria-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-5 pb-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  )
}
