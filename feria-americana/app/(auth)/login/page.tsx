'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('No pudimos enviar el link. Revisá el email e intentá de nuevo.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-feria-lavender flex flex-col items-center justify-center px-6 py-12">
      {/* Decorative newspaper strips */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-feria-cream opacity-20" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-feria-cream opacity-20" />

      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-feria-cream rounded-2xl mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-feria-lavender" />
          </div>
          <h1 className="font-display text-5xl font-bold text-feria-cream tracking-tight leading-none">
            Feria
          </h1>
          <h2 className="font-display text-5xl font-bold text-feria-cream tracking-tight leading-none">
            Americana
          </h2>
          <p className="mt-3 text-feria-lavender-light text-sm font-medium">
            Ropa de hombre y mujer
          </p>
        </div>

        {/* Card */}
        <div className="card-paper p-6">
          {!sent ? (
            <>
              <h3 className="font-display text-2xl font-semibold text-feria-dark mb-1">
                Ingresar
              </h3>
              <p className="text-feria-muted text-sm mb-6">
                Te mandamos un link mágico al mail para entrar sin contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading || !email}
                >
                  {loading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="font-display text-2xl font-semibold text-feria-dark mb-2">
                ¡Revisá tu mail!
              </h3>
              <p className="text-feria-muted text-sm mb-5">
                Enviamos un link a <strong className="text-feria-dark">{email}</strong>. Tocalo para entrar.
              </p>
              <button
                className="text-feria-lavender text-sm font-medium underline underline-offset-2"
                onClick={() => { setSent(false); setEmail('') }}
              >
                Usar otro email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-feria-lavender-light text-xs mt-6">
          09 / 05 · Highland Park
        </p>
      </div>
    </div>
  )
}
