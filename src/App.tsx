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
import ConfiguracionHogar from './pages/ConfiguracionHogar'
import { cargarPerfilHogar } from './lib/perfilHogar'
import Planning from './pages/Planning'
import CalendarioPlanning from './pages/CalendarioPlanning'
import Recetas from './pages/Recetas'
import Inventario from './pages/Inventario'
import Compra from './pages/Compra'
import Auth from './pages/Auth'
import ChefRayku from './pages/ChefRayku'
import WorkspaceSwitcher from './components/workspaces/WorkspaceSwitcher'
import { useUnifiedWorkspace } from './lib/useUnifiedWorkspace'
import TabletMode from './pages/TabletMode'
import TabletDemo from './pages/TabletDemo'
import { descargarCompra, subirCompra } from './lib/sync'
import { listHouseholds } from './lib/workspaces'
import { normalizarCompraManual } from './store/normalizers'
import { guardarCompraManualLocal, guardarChecksCompraLocal } from './store/storage'

type Pagina =
  | 'inicio'
  | 'configuracion'
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
  'configuracion',
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

function MainApp() {
  const [modoTablet, setModoTablet] = useState(false)
  const [inicializando, setInicializando] = useState(true)
  const [errorInicializacion, setErrorInicializacion] = useState('')
  const [paginaAnteriorConfiguracion, setPaginaAnteriorConfiguracion] = useState<Pagina>('inicio')
  const [perfilConfigurado, setPerfilConfigurado] = useState(() => cargarPerfilHogar().configurado)

  const [session, setSession] =
    useState<Session | null>(null)

  const [
    mensajeNube,
    setMensajeNube,
  ] = useState('')
  const workspace = useUnifiedWorkspace(session?.user.id ?? '')

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
    let cancelled = false
    setInicializando(true)
    setErrorInicializacion('')
    const initialize = async () => {
      try {
        await Promise.all([
          sincronizarRecetasDesdeSupabase(session.user.id),
          sincronizarInventarioDesdeSupabase(session.user.id),
          sincronizarPlanningDesdeSupabase(session.user.id),
        ])
        const compra = await descargarCompra(session.user.id)
        if (compra && !cancelled) {
          const compraManual = compra.compraManual.map(normalizarCompraManual)
          const checksCompra = compra.checksCompra.filter((c): c is string => typeof c === 'string')
          guardarCompraManualLocal(compraManual)
          guardarChecksCompraLocal(checksCompra)
          useRaykuStore.setState({ compraManual, checksCompra })
        }
        const households = await listHouseholds()
        if (!cancelled && households.length) {
          await workspace.select(households[0].id)
        }
      } catch (error) {
        console.error('No se pudo inicializar el hogar:', error)
        if (!cancelled) setErrorInicializacion(error instanceof Error ? error.message : String(error))
      } finally {
        if (!cancelled) setInicializando(false)
      }
    }
    void initialize()
    return () => { cancelled = true }
  }, [session?.user.id])

  /* Previous personal-only startup sync disabled: initialization above now
     loads personal data first, then activates the household if it exists.
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

    // Load shopping only when a cloud copy exists; preserve legacy local lists otherwise.
    descargarCompra(session.user.id).then(compra => {
      if (!compra) return
      const compraManual = compra.compraManual.map(normalizarCompraManual)
      const checksCompra = compra.checksCompra.filter((c): c is string => typeof c === 'string')
      guardarCompraManualLocal(compraManual)
      guardarChecksCompraLocal(checksCompra)
      useRaykuStore.setState({ compraManual, checksCompra })
    }).catch(error => console.error('No se pudo cargar la compra:', error))
  }, [
    session?.user.id,

    sincronizarRecetasDesdeSupabase,
    sincronizarInventarioDesdeSupabase,
    sincronizarPlanningDesdeSupabase,
  ])

  */

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
      if (workspace.selection !== 'personal') {
        try {
          await workspace.saveNow()
          setMensajeNube('✅ Hogar guardado en la nube')
        } catch (error) {
          setMensajeNube('⚠️ Error al guardar hogar: ' + (error instanceof Error ? error.message : String(error)))
        }
        return
      }

      await guardarRecetasEnSupabase(
        session.user.id
      )

      await guardarInventarioEnSupabase(
        session.user.id
      )

      await guardarPlanningEnSupabase(
        session.user.id
      )

      const { compraManual, checksCompra } = useRaykuStore.getState()
      await subirCompra(compraManual, checksCompra, session.user.id)

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

  if (inicializando && session) {
    return <div className="app"><main className="contenido-principal"><section className="card" role="status"><h2>🏡 Preparando tu hogar…</h2><p>Estamos cargando tus recetas, planning, compra e inventario. Espera antes de hacer cambios.</p></section></main></div>
  }

  if (!perfilConfigurado || paginaActual === 'configuracion') {
    return <div className="app"><main className="contenido-principal">
      {perfilConfigurado && <button type="button" className="btn-secundario" onClick={() => setPaginaActual(paginaAnteriorConfiguracion)}>← Volver sin guardar</button>}
      <WorkspaceSwitcher userId={session.user.id} selection={workspace.selection} onSelect={workspace.select} busy={workspace.busy} />
      <ConfiguracionHogar onTerminar={() => { setPerfilConfigurado(true); setPaginaActual(paginaAnteriorConfiguracion) }} onInventario={() => { setPerfilConfigurado(true); setPaginaActual('inventario') }} />
    </main></div>
  }

  if (modoTablet) {
    return <TabletMode onSalir={() => setModoTablet(false)} />
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

          <button type="button" className="btn-secundario" onClick={() => { setPaginaAnteriorConfiguracion(paginaActual); setPaginaActual('configuracion') }}>⚙️ Hogar</button>
          <button type="button" className="btn-secundario" onClick={() => setModoTablet(true)}>
            📱 Modo tablet
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

      {errorInicializacion && <p role="alert" style={{textAlign:'center'}}>⚠️ No se ha podido cargar el hogar: {errorInicializacion}. Evita editar hasta resolverlo.</p>}
      {workspace.message && <p role="status" style={{textAlign:'center',margin:12}}>{workspace.message}</p>}

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

      <main className="contenido-principal" aria-busy={workspace.busy}>
        {workspace.busy ? <p role="status">Cambiando de espacio y protegiendo tus datos…</p> : <>
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
        </>}
      </main>
    </div>
  )
}

// The standalone demo never mounts the authenticated app or its Supabase sync effects.
export default function App() {
  if (window.location.pathname === '/demo-tablet') {
    return <TabletDemo />
  }
  return <MainApp />
}
