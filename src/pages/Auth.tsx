import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [modoRegistro, setModoRegistro] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const handleAuth = async () => {
    try {
      setLoading(true)
      setMensaje('')

      if (modoRegistro) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        setMensaje(
          '💌 Revisa tu email para confirmar la cuenta'
        )
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (error) throw error
      }
    } catch (err: any) {
      setMensaje(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '42px',
              marginBottom: '10px',
            }}
          >
            🍽️ Rayku
          </h1>

          <p
            style={{
              color: '#9e7d90',
            }}
          >
            Tu app cute de recetas y planning 💕
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '14px',
          }}
        >
          <input
            type="email"
            placeholder="📧 Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="🔒 Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="btn-principal"
            onClick={handleAuth}
            disabled={loading}
          >
            {loading
              ? '✨ Cargando...'
              : modoRegistro
              ? '💖 Crear cuenta'
              : '🌸 Entrar'}
          </button>

          <button
            className="btn-secundario"
            onClick={() =>
              setModoRegistro(!modoRegistro)
            }
          >
            {modoRegistro
              ? 'Ya tengo cuenta'
              : 'Crear cuenta nueva'}
          </button>

          {mensaje && (
            <div
              className="card"
              style={{
                background: '#fff7fb',
                color: '#c45b86',
                fontSize: '14px',
              }}
            >
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}