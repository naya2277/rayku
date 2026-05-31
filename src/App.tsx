import {
  useEffect,
  useState,
} from 'react'

import type {
  Session,
} from '@supabase/supabase-js'

import {
  supabase,
} from './lib/supabase'

import {
  useRaykuStore,
} from './store'

import Inicio from './pages/Inicio'
import Planning from './pages/Planning'
import CalendarioPlanning from './pages/CalendarioPlanning'
import Recetas from './pages/Recetas'
import Inventario from './pages/Inventario'
import Compra from './pages/Compra'
import Auth from './pages/Auth'
import ChefRayku from './pages/ChefRayku'

type Pagina =
  | 'inicio'
  | 'chef'
  | 'planning'
  | 'calendario'
  | 'recetas'
  | 'inventario'
  | 'compra'

const PAGINA_KEY =
  'rayku-pagina-actual'

const PAGINAS_VALIDAS: Pagina[] = [
  'inicio',
  'chef',
  'planning',
  'calendario',
  'recetas',
  'inventario',
  'compra',
]

function obtenerPaginaInicial(): Pagina {
  const guardada =
    sessionStorage.getItem(
      PAGINA_KEY
    ) as Pagina | null

  if (
    guardada &&
    PAGINAS_VALIDAS.includes(
      guardada
    )
  ) {
    return guardada
  }

  return 'inicio'
}

export default function App() {
  const [session, setSession] =
    useState<Session | null>(null)

  const [
    mensajeNube,
    setMensajeNube,
  ] = useState('')

  const {
    sincronizarRecetasDesdeSupabase,
    guardarRecetasEnSupabase,

    sincronizarInventarioDesdeSupabase,
    guardarInventarioEnSupabase,

    sincronizarPlanningDesdeSupabase,
    guardarPlanningEnSupabase,
  } = useRaykuStore()

  const [
    paginaActual,
    setPaginaActual,
  ] = useState<Pagina>(
    obtenerPaginaInicial
  )

  const [
    recetaSeleccionadaId,
    setRecetaSeleccionadaId,
  ] = useState<string | null>(
    null
  )

  useEffect(() => {
    sessionStorage.setItem(
      PAGINA_KEY,
      paginaActual
    )
  }, [paginaActual])

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(
        ({
          data: {
            session,
          },
        }) => {
          setSession(session)
        }
      )

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
        }
      )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user.id) return

    sincronizarRecetasDesdeSupabase(
      session.user.id
    )

    sincronizarInventarioDesdeSupabase(
      session.user.id
    )

    sincronizarPlanningDesdeSupabase(
      session.user.id
    )
  }, [
    session?.user.id,

    sincronizarRecetasDesdeSupabase,
    sincronizarInventarioDesdeSupabase,
    sincronizarPlanningDesdeSupabase,
  ])

  const abrirReceta = (
    recetaId: string
  ) => {
    setRecetaSeleccionadaId(
      recetaId
    )

    setPaginaActual('recetas')
  }

  const guardarEnNube =
    async () => {
      if (!session?.user.id) return

      setMensajeNube(
        '☁️ Guardando...'
      )

      await guardarRecetasEnSupabase(
        session.user.id
      )

      await guardarInventarioEnSupabase(
        session.user.id
      )

      await guardarPlanningEnSupabase(
        session.user.id
      )

      setMensajeNube(
        '✅ Datos guardados en la nube'
      )

      setTimeout(() => {
        setMensajeNube('')
      }, 2500)
    }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app">
      <nav className="nav-principal">
        <div className="nav-logo">
          <span className="logo-emoji">
            🍽️
          </span>

          <span className="logo-texto">
            Rayku
          </span>
        </div>

        <div className="nav-links">
          <button
            type="button"
            className={
              paginaActual === 'inicio'
                ? 'activo'
                : ''
            }
            onClick={() =>
              setPaginaActual(
                'inicio'
              )
            }
          >
            🏠 Inicio
          </button>
          <button
  type="button"
  className={
    paginaActual === 'chef'
      ? 'activo'
      : ''
  }
  onClick={() =>
    setPaginaActual(
      'chef'
    )
  }
>
  🐶‍🍳 Chef Rayku
</button>

          <button
            type="button"
            className={
              paginaActual ===
              'planning'
                ? 'activo'
                : ''
            }
            onClick={() =>
              setPaginaActual(
                'planning'
              )
            }
          >
            🗓️ Planning
          </button>

          <button
            type="button"
            className={
              paginaActual ===
              'calendario'
                ? 'activo'
                : ''
            }
            onClick={() =>
              setPaginaActual(
                'calendario'
              )
            }
          >
            📅 Calendario
          </button>

          <button
            type="button"
            className={
              paginaActual ===
              'recetas'
                ? 'activo'
                : ''
            }
            onClick={() =>
              setPaginaActual(
                'recetas'
              )
            }
          >
            📖 Recetas
          </button>

          <button
            type="button"
            className={
              paginaActual ===
              'compra'
                ? 'activo'
                : ''
            }
            onClick={() =>
              setPaginaActual(
                'compra'
              )
            }
          >
            🛒 Compra
          </button>

          <button
            type="button"
            className={
              paginaActual ===
              'inventario'
                ? 'activo'
                : ''
            }
            onClick={() =>
              setPaginaActual(
                'inventario'
              )
            }
          >
            📦 Inventario
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={
              guardarEnNube
            }
          >
            ☁️ Guardar
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              supabase.auth.signOut()
            }
          >
            🚪 Salir
          </button>
        </div>
      </nav>

      {mensajeNube && (
        <div
          className="card"
          style={{
            margin:
              '14px auto 0',
            maxWidth:
              '900px',
            width:
              'calc(100% - 28px)',
            color: '#8f7080',
            textAlign:
              'center',
          }}
        >
          {mensajeNube}
        </div>
      )}

      <main className="contenido-principal">
        {paginaActual ===
          'inicio' && (
          <Inicio
            onAbrirReceta={
              abrirReceta
            }
          />
        )}
        {paginaActual ===
  'chef' && (
  <ChefRayku
    onAbrirReceta={
      abrirReceta
    }
  />
)}

        {paginaActual ===
          'planning' && (
          <Planning
            onAbrirReceta={
              abrirReceta
            }
          />
        )}

        {paginaActual ===
          'calendario' && (
          <CalendarioPlanning
            onAbrirReceta={
              abrirReceta
            }
          />
        )}

        {paginaActual ===
          'recetas' && (
          <Recetas
            recetaSeleccionadaId={
              recetaSeleccionadaId
            }
            onRecetaSeleccionadaLeida={() =>
              setRecetaSeleccionadaId(
                null
              )
            }
          />
        )}

        {paginaActual ===
          'compra' && (
          <Compra />
        )}

        {paginaActual ===
          'inventario' && (
          <Inventario />
        )}
      </main>
    </div>
  )
}