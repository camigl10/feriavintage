'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { USER_COLORS } from '@/lib/constants'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState<string>(USER_COLORS[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('users').insert({
      id: user.id,
      nombre: nombre.trim(),
      email: user.email!,
      color,
      role: 'comprador',
    })

    if (error) {
      setError('No pudimos guardar tu perfil. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/inventario')
  }

  return (
    <div className="min-h-dvh bg-feria-lavender flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-feria-cream mb-2">
            ¡Bienvenida/o!
          </h1>
          <p className="text-feria-lavender-light text-sm">
            Completá tu perfil para entrar a la feria.
          </p>
        </div>

        <div className="card-paper p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label" htmlFor="nombre">
                Tu nombre
              </label>
              <input
                id="nombre"
                type="text"
                className="input"
                placeholder="Ej: Camila"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                autoFocus
                maxLength={50}
              />
            </div>

            <div>
              <label className="label">Tu color identificador</label>
              <p className="text-xs text-feria-muted mb-3">
                Tus productos van a aparecer con este color para reconocerlos fácil.
              </p>
              <div className="grid grid-cols-4 gap-3">
                {USER_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-12 h-12 rounded-full transition-all duration-150"
                      style={{
                        backgroundColor: c.value,
                        boxShadow: color === c.value
                          ? `0 0 0 3px white, 0 0 0 5px ${c.value}`
                          : 'none',
                        transform: color === c.value ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                    <span className="text-xs text-feria-muted">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-feria-cream-dark rounded-xl p-3 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="font-medium text-feria-dark">
                {nombre || 'Tu nombre'}
              </span>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || !nombre.trim()}
            >
              {loading ? 'Guardando...' : 'Entrar a la feria →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
