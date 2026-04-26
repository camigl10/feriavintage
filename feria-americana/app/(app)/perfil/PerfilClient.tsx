'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Shield, Edit2, Check } from 'lucide-react'
import { USER_COLORS } from '@/lib/constants'
import { activateVendor, updateProfile, signOut } from '@/app/actions/users'
import { useToast } from '@/components/ToastProvider'
import type { UserProfile } from '@/lib/types'

export function PerfilClient({ profile }: { profile: UserProfile }) {
  const router = useRouter()
  const { toast } = useToast()
  const isVendedor = profile.role === 'vendedor'

  const [editingProfile, setEditingProfile] = useState(false)
  const [nombre, setNombre] = useState(profile.nombre)
  const [color, setColor] = useState(profile.color)
  const [savingProfile, setSavingProfile] = useState(false)

  const [vendorCode, setVendorCode] = useState('')
  const [activating, setActivating] = useState(false)
  const [showVendorInput, setShowVendorInput] = useState(false)

  async function handleSaveProfile() {
    if (!nombre.trim()) return
    setSavingProfile(true)
    const result = await updateProfile({ nombre, color })
    setSavingProfile(false)
    if (result.success) {
      toast({ type: 'success', message: 'Perfil actualizado.' })
      setEditingProfile(false)
      router.refresh()
    } else {
      toast({ type: 'error', message: result.error ?? 'Error al actualizar.' })
    }
  }

  async function handleActivateVendor() {
    if (!vendorCode.trim()) return
    setActivating(true)
    const result = await activateVendor(vendorCode)
    setActivating(false)
    if (result.success) {
      toast({ type: 'success', message: '¡Modo vendedor activado! Ya podés vender y ver el dashboard.' })
      router.refresh()
    } else {
      toast({ type: 'error', message: result.error ?? 'Código incorrecto.' })
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      <h1 className="page-header">Perfil</h1>

      {/* Profile card */}
      <div className="card-paper p-5">
        {!editingProfile ? (
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex-shrink-0"
              style={{ backgroundColor: profile.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-display text-2xl font-bold text-feria-dark truncate">{profile.nombre}</p>
              <p className="text-feria-muted text-sm truncate">{profile.email}</p>
              <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isVendedor
                  ? 'bg-feria-lavender/15 text-feria-lavender-dark'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isVendedor ? '🛍️ Vendedor/a' : '👤 Comprador/a'}
              </span>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="w-9 h-9 rounded-full bg-feria-cream-dark flex items-center justify-center text-feria-muted"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="edit-nombre">Nombre</label>
              <input
                id="edit-nombre"
                type="text"
                className="input"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                maxLength={50}
                autoFocus
              />
            </div>

            <div>
              <label className="label">Color</label>
              <div className="grid grid-cols-4 gap-3">
                {USER_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: c.value,
                        boxShadow: color === c.value ? `0 0 0 3px white, 0 0 0 5px ${c.value}` : 'none',
                        transform: color === c.value ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {color === c.value && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs text-feria-muted">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setEditingProfile(false); setNombre(profile.nombre); setColor(profile.color) }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || !nombre.trim()}
                className="btn-primary flex-1"
              >
                {savingProfile ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vendor activation */}
      {!isVendedor && (
        <div className="card-paper p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-feria-lavender/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-feria-lavender" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-feria-dark">Activar modo vendedor</h3>
              <p className="text-feria-muted text-sm mt-0.5">
                Ingresá el código secreto de la feria para poder vender y ver el dashboard.
              </p>
            </div>
          </div>

          {!showVendorInput ? (
            <button
              onClick={() => setShowVendorInput(true)}
              className="btn-primary w-full mt-4"
            >
              Tengo el código
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                className="input text-center font-mono tracking-widest text-lg"
                placeholder="código secreto"
                value={vendorCode}
                onChange={e => setVendorCode(e.target.value)}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
              />
              <button
                onClick={handleActivateVendor}
                disabled={activating || !vendorCode.trim()}
                className="btn-primary w-full"
              >
                {activating ? 'Verificando...' : 'Activar'}
              </button>
            </div>
          )}
        </div>
      )}

      {isVendedor && (
        <div className="card-paper p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-feria-lavender flex-shrink-0" />
          <div>
            <p className="font-semibold text-feria-dark text-sm">Modo vendedor activo</p>
            <p className="text-feria-muted text-xs">Podés vender productos y ver el dashboard.</p>
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="btn-secondary w-full flex items-center justify-center gap-2 text-red-600 border-red-200 bg-red-50"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>

      <p className="text-center text-feria-muted text-xs pb-2">
        Feria Americana · 09/05 · Highland Park
      </p>
    </div>
  )
}
