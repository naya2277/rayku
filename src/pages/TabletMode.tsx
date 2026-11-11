import { useRef, useState } from 'react'
import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRaykuStore } from '../store'
import { separarIngredientesPorInventario } from '../lib/generarListaCompra'
import { planificarCompraPorConservacion } from '../lib/compra/planificarCompraPorConservacion'
import './TabletMode.css'

const PRODUCTOS = [
  ['🍗','Muslitos de pollo'],['🥩','Pechuga de pollo'],['🍅','Tomates'],
  ['🥔','Patatas'],['🥚','Huevos'],['🥛','Leche'],['🍚','Arroz'],
  ['🍝','Macarrones'],['🥕','Zanahorias'],['🥦','Brócoli'],
  ['🐟','Salmón'],['🧀','Queso'],['🍎','Manzanas'],['🍞','Pan'],
] as const
const CATEGORIAS = ['Todos', 'Carnes y pescado', 'Verduras', 'Básicos', 'Lácteos y huevos'] as const
const CATEGORIA_PRODUCTO: Record<string, typeof CATEGORIAS[number]> = {
  'Muslitos de pollo': 'Carnes y pescado', 'Pechuga de pollo': 'Carnes y pescado',
  'Salmón': 'Carnes y pescado', 'Tomates': 'Verduras', 'Patatas': 'Verduras',
  'Zanahorias': 'Verduras', 'Brócoli': 'Verduras', 'Manzanas': 'Verduras',
  'Huevos': 'Lácteos y huevos', 'Leche': 'Lácteos y huevos',
  'Queso': 'Lácteos y huevos', 'Arroz': 'Básicos',
  'Macarrones': 'Básicos', 'Pan': 'Básicos',
}
const CANTIDADES = ['1 unidad', '2 unidades', '500 g', '1 kg', '1 paquete', '2 paquetes']

type Props = { onSalir: () => void }

export default function TabletMode({ onSalir }: Props) {
  const { planning, recetas, inventario, compraManual, checksCompra, agregarItemCompraManual, eliminarItemCompraManual, guardarHuecoPlanning, limpiarHuecoPlanning } = useRaykuStore()
  const vistaPrevia = window.location.hostname.includes('rayku-git-rayku-20')
  const [edicionPruebas, setEdicionPruebas] = useState(() => localStorage.getItem('rayku-tablet-edicion-activada-v1') === 'si')
  const soloLectura = vistaPrevia && !edicionPruebas
  const [panel, setPanel] = useState<'calendario' | 'compra'>('calendario')
  const [semana, setSemana] = useState(new Date())
  const [recetaId, setRecetaId] = useState<string | null>(null)
  const [producto, setProducto] = useState<string | null>(null)
  const [huecoEditando, setHuecoEditando] = useState<{ fecha: string; tipo: 'comida' | 'cena' } | null>(null)
  const [busquedaReceta, setBusquedaReceta] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [categoria, setCategoria] = useState<typeof CATEGORIAS[number]>('Todos')
  const inicio = startOfWeek(semana, { weekStartsOn: 1 })
  const touchX = useRef<number | null>(null)
  const receta = recetas.find(r => r.id === recetaId)
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicio, i))
  const hoy = format(inicio, 'yyyy-MM-dd')
  const fin = format(addDays(inicio, 6), 'yyyy-MM-dd')
  const comprasProgramadas=planificarCompraPorConservacion(
    planning.filter(p=>p.fecha>=hoy&&p.fecha<=fin&&!p.cocinado),
    recetas,new Date()
  )
  const generados = separarIngredientesPorInventario(comprasProgramadas.ahora, inventario).paraComprar
  const posteriores=comprasProgramadas.despues
  const pendientesGenerados = generados.filter(i => !checksCompra.includes(i.clave))
  const productosVisibles = PRODUCTOS.filter(([, nombre]) => categoria === 'Todos' || CATEGORIA_PRODUCTO[nombre] === categoria)


  function activarEdicion() {
    // Download a point-in-time copy before allowing test mutations.
    const estado = useRaykuStore.getState()
    const copia = {
      exportadoEn: new Date().toISOString(),
      recetas: estado.recetas,
      planning: estado.planning,
      inventario: estado.inventario,
      compraManual: estado.compraManual,
      checksCompra: estado.checksCompra,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(copia, null, 2)], { type: 'application/json' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `rayku-copia-antes-de-pruebas-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(url)
    localStorage.setItem('rayku-tablet-edicion-activada-v1', 'si')
    setEdicionPruebas(true)
  }

  function elegirReceta(id: string | null) {
    if (!huecoEditando || soloLectura) return
    const { fecha, tipo } = huecoEditando
    if (id === null) {
      limpiarHuecoPlanning(fecha, tipo)
    } else {
      guardarHuecoPlanning({
        fecha, tipoComida: tipo, recetaId: id, recetaIds: [id],
        comidaLibre: '', nota: '', cocinado: false,
      })
    }
    setHuecoEditando(null)
    setBusquedaReceta('')
  }

  function agregar(cantidad: string) {
    if (!producto || soloLectura) return
    agregarItemCompraManual({ id: '', nombre: producto, cantidad })
    setConfirmacion(`${producto} · ${cantidad} añadido a la compra`)
    setProducto(null)
  }

  return (
    <div className="tablet-mode"
      onTouchStart={e => { touchX.current = e.touches[0]?.clientX ?? null }}
      onTouchEnd={e => {
        const final = e.changedTouches[0]?.clientX
        if (touchX.current === null || final === undefined || recetaId || producto || huecoEditando) return
        const distancia = final - touchX.current
        if (Math.abs(distancia) > 90) setPanel(distancia < 0 ? 'compra' : 'calendario')
        touchX.current = null
      }}>
      <header className="tablet-header">
        <strong>💜 Rayku · Modo tablet</strong>
        <nav aria-label="Pantallas del modo tablet">
          <button className={panel === 'calendario' ? 'tablet-active' : ''} onClick={() => setPanel('calendario')}>📅 Menú</button>
          <button className={panel === 'compra' ? 'tablet-active' : ''} onClick={() => setPanel('compra')}>🛒 Compra ({compraManual.length + pendientesGenerados.length})</button>
          <button onClick={onSalir}>✕ Salir</button>
        </nav>
      </header>
      {soloLectura && <div className="tablet-preview-warning" role="status">🔒 Primera activación en este navegador. <button type="button" onClick={activarEdicion}>💾 Descargar copia y activar edición</button></div>}
      {panel === 'calendario' ? (
        <main className="tablet-content">
          <div className="tablet-week-nav">
            <button onClick={() => setSemana(subWeeks(semana, 1))}>‹</button>
            <h1>{format(inicio, "'Semana del' d 'de' MMMM", { locale: es })}</h1>
            <button onClick={() => setSemana(addWeeks(semana, 1))}>›</button>
          </div>
          <div className="tablet-calendar">
            {dias.map(dia => {
              const fecha = format(dia, 'yyyy-MM-dd')
              return <section className="tablet-day" key={fecha}>
                <h2>{format(dia, 'EEEE d', { locale: es })}</h2>
                {(['comida','cena'] as const).map(tipo => {
                  const hueco = planning.find(p => p.fecha === fecha && p.tipoComida === tipo)
                  const ids = hueco?.recetaIds?.length ? hueco.recetaIds : hueco?.recetaId ? [hueco.recetaId] : []
                  const platos = ids.map(id => recetas.find(r => r.id === id)).filter((r): r is typeof recetas[number] => Boolean(r))
                  return <div className="tablet-meal" key={tipo}>
                    <small>{tipo === 'comida' ? '☀️ Comida' : '🌙 Cena'}</small>
                    {platos.map(r => <button key={r.id} onClick={() => setRecetaId(r.id)}>{r.nombre}</button>)}
                    {hueco?.comidaLibre && <p>{hueco.comidaLibre}</p>}
                    {!platos.length && !hueco?.comidaLibre && <p>Sin planificar</p>}
                    <button className="tablet-edit-meal" disabled={soloLectura} onClick={() => setHuecoEditando({ fecha, tipo })}>✏️ Cambiar</button>
                  </div>
                })}
              </section>
            })}
          </div>
          <p className="tablet-hint">Desliza a la izquierda para abrir la compra →</p>
        </main>
      ) : (
        <main className="tablet-content">
          <h1>🛒 Añadir sin escribir</h1>
          <p>{soloLectura ? 'Activa la edición de prueba para añadir productos.' : 'Toca un producto y elige la cantidad.'}</p>
          <div className="tablet-categories" aria-label="Categorías de productos">
            {CATEGORIAS.map(c => <button key={c} className={categoria === c ? 'tablet-active' : ''} onClick={() => setCategoria(c)}>{c}</button>)}
          </div>
          <div className="tablet-shopping-summary">
            🧺 En tu lista: {compraManual.length} añadidos a mano · {pendientesGenerados.length} ingredientes del menú
          </div>
          <div className="tablet-products">
            {productosVisibles.map(([emoji, nombre]) =>
              <button key={nombre} onClick={() => { if (!soloLectura) setProducto(nombre) }} disabled={soloLectura}>
                <span aria-hidden="true">{emoji}</span>{nombre}
              </button>
            )}
          </div>
          {posteriores.length>0&&<section className="tablet-later" aria-label="Compra programada para más adelante">
            <h2>📅 Comprar más adelante ({posteriores.length})</h2>
            <p>Separa los alimentos frescos para que no se estropeen antes de cocinar.</p>
            <div className="tablet-shopping">
              {posteriores.map(item=><div key={item.clave}>
                <span><strong>{item.nombre}</strong> · comprar desde {item.comprarDesde} · usar {item.primeraUtilizacion}</span>
              </div>)}
            </div>
          </section>}
          <h2>Lista de compra</h2>
          {pendientesGenerados.length > 0 && <div className="tablet-shopping">
            {pendientesGenerados.map(item => <div key={item.clave}><span>📋 {item.nombre} · {item.cantidadFaltante ?? item.cantidad ?? 'cantidad por revisar'} {item.unidad ?? ''}</span></div>)}
          </div>}
          <div className="tablet-shopping">
            {compraManual.length === 0 && <p>No has añadido productos manuales.</p>}
            {compraManual.map(item => <div key={item.id}>
              <span>{item.nombre} {item.cantidad ? '· ' + item.cantidad : ''}</span>
              <button aria-label={`Quitar ${item.nombre}`} onClick={() => eliminarItemCompraManual(item.id)} disabled={soloLectura}>✕</button>
            </div>)}
          </div>
          {confirmacion && <p role="status">{confirmacion}</p>}
          <p className="tablet-hint">← Desliza a la derecha para volver al menú</p>
        </main>
      )}
      {huecoEditando && <div className="tablet-overlay" role="dialog" aria-modal="true" aria-label="Cambiar comida">
        <div className="tablet-dialog">
          <h2>✏️ Cambiar {huecoEditando.tipo} · {huecoEditando.fecha}</h2>
          <input aria-label="Buscar recetas" placeholder="Buscar entre tus recetas…" value={busquedaReceta} onChange={e => setBusquedaReceta(e.target.value)} style={{ padding: 14, borderRadius: 12, border: '1px solid #e3c6dd', font: 'inherit' }} />
          <div className="tablet-recipe-options">
            {recetas.filter(r => r.nombre.toLocaleLowerCase('es').includes(busquedaReceta.toLocaleLowerCase('es'))).map(r => <button key={r.id} onClick={() => elegirReceta(r.id)}>🍽️ {r.nombre}</button>)}
            <button onClick={() => elegirReceta(null)}>➖ Dejar sin planificar</button>
          </div>
          <button className="btn-secundario" onClick={() => { setHuecoEditando(null); setBusquedaReceta('') }}>Cancelar</button>
        </div>
      </div>}
      {producto && <div className="tablet-overlay" role="dialog" aria-modal="true" aria-label={`Cantidad de ${producto}`}>
        <div className="tablet-dialog">
          <h2>¿Cuánto necesitas de {producto}?</h2>
          <div className="tablet-quantities">{CANTIDADES.map(c => <button key={c} onClick={() => agregar(c)}>{c}</button>)}</div>
          <button className="btn-secundario" onClick={() => setProducto(null)}>Cancelar</button>
        </div>
      </div>}
      {receta && <div className="tablet-overlay" role="dialog" aria-modal="true" aria-label={receta.nombre}>
        <div className="tablet-dialog">
          <h2>🍽️ {receta.nombre}</h2>
          <h3>Ingredientes</h3>
          <ul>{receta.ingredientes.map((i, n) => <li key={n}>{i}</li>)}</ul>
          <h3>Preparación</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{receta.pasos}</p>
          <button className="btn-principal" onClick={() => setRecetaId(null)}>Cerrar receta</button>
        </div>
      </div>}
    </div>
  )
}
