'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { UNDO_TIMEOUT_MS } from '@/lib/constants'
import type { UndoSaleData } from '@/lib/types'

interface UndoToastProps {
  data: UndoSaleData | null
  onUndo: (saleId: string, productId: string) => void
  onExpire: () => void
}

export function UndoToast({ data, onUndo, onExpire }: UndoToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (!data) return

    const totalSeconds = Math.ceil(UNDO_TIMEOUT_MS / 1000)
    setSecondsLeft(totalSeconds)

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [data?.saleId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return null

  const progress = (secondsLeft / Math.ceil(UNDO_TIMEOUT_MS / 1000)) * 100

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-feria-dark text-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-feria-lavender-light transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              ¡Vendido! {data.productTitulo}
            </p>
            <p className="text-xs text-white/60">
              Se guarda en {secondsLeft}s
            </p>
          </div>
          <button
            onClick={() => onUndo(data.saleId, data.productId)}
            className="flex-shrink-0 bg-white/20 hover:bg-white/30 active:scale-95
                       text-white text-sm font-bold rounded-xl px-4 py-2 transition-all"
          >
            Deshacer
          </button>
        </div>
      </div>
    </div>
  )
}
