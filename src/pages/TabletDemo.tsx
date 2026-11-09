import { useRef, useState } from 'react'
import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import './TabletMode.css'

type Producto = { nombre: string; emoji: string; categoria: string }
type CompraDemo = { id: number; nombre: string; cantidad: string }
const PRODUCTOS: Producto[] = [
  { nombre: 'Muslitos de pollo', emoji: '🍗', categoria: 'Carnes' },
  { nombre: 'Pechuga de pollo', emoji: '🐔', categoria: 'Carnes' },
  { nombre: 'Salmón', emoji: '🐟', categoria: 'Carnes' },
  { nombre: 'Tomates', emoji: '🍅', categoria: 'Verduras' },
  { nombre: 'Patatas', emoji: '🥔', categoria: 'Verduras' },
  { nombre: 'Zanahorias', emoji: '🥕', categoria: 'Verduras' },
  { nombre: 'Brócoli', emoji: '🥦', categoria: 'Verduras' },
  { nombre: 'Huevos', emoji: '🥚', categoria: 'Lácteos' },
  { nombre: 'Leche', emoji: '🥛', categoria: 'Lácteos' },
  { nombre: 'Queso', emoji: '🧀', categoria: 'Lácteos' },
  { nombre: 'Arroz', emoji: '🍚', categoria: 'Básicos' },
  { nombre: 'Macarrones', emoji: '🍝', categoria: 'Básicos' },
]
const CANTIDADES = ['1 unidad', '2 unidades', '6 unidades', '500 g', '1 kg', '1 paquete']
const RECETAS = [
  { nombre: 'Pollo al horno con patatas', ingredientes: ['Muslitos de pollo', 'Patatas', 'Aceite de oliva'], pasos: 'Precalienta el horno, sazona el pollo y las patatas y hornea hasta que esté bien cocinado.' },
  { nombre: 'Salmón con brócoli', ingredientes: ['Salmón', 'Brócoli', 'Limón'], pasos: 'Cocina el salmón y el brócoli hasta que estén en su punto.' },
  { nombre: 'Tortilla de patatas', ingredientes: ['Huevos', 'Patatas', 'Aceite de oliva'], pasos: 'Cocina las patatas y cuájalas con los huevos batidos.' },
]
export default function TabletDemo() {
  const [panel, setPanel] = useState<'calendario' | 'compra'>('calendario')
  const [semana, setSemana] = useState(new Date())
  const [categoria, setCategoria] = useState('Todos')
  const [seleccion, setSeleccion] = useState<Producto | null>(null)
  const [receta, setReceta] = useState<typeof RECETAS[number] | null>(null)
  const [compra, setCompra] = useState<CompraDemo[]>([])
  const [confirmacion, setConfirmacion] = useState('')
  const inicio = startOfWeek(semana, { weekStartsOn: 1 })
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicio, i))
  const inicioDeslizamiento = useRef<number | null>(null)
  function agregar(cantidad: string) {
    if (!seleccion) return
    setCompra(items => [...items, { id: Date.now() + Math.random(), nombre: seleccion.nombre, cantidad }])
    setConfirmacion(`${seleccion.nombre}: ${cantidad} añadido a la lista de prueba`)
    setSeleccion(null)
  }
  return <div className="tablet-mode" onTouchStart={e => { inicioDeslizamiento.current = e.touches[0]?.clientX ?? null }}
    onTouchEnd={e => {
      const final = e.changedTouches[0]?.clientX
      if (inicioDeslizamiento.current === null || final === undefined || seleccion || receta) return
      const distancia = final - inicioDeslizamiento.current
      if (Math.abs(distancia) > 90) setPanel(distancia < 0 ? 'compra' : 'calendario')
      inicioDeslizamiento.current = null
    }}>
    <header className="tablet-header">
      <strong>💜 Rayku · Demo tablet</strong>
      <nav>
        <button className={panel === 'calendario' ? 'tablet-active' : ''} onClick={() => setPanel('calendario')}>📅 Menú</button>
        <button className={panel === 'compra' ? 'tablet-active' : ''} onClick={() => setPanel('compra')}>🛒 Compra ({compra.length})</button>
        <button onClick={() => setCompra([])}>↻ Reiniciar prueba</button>
      </nav>
    </header>
    <div className="tablet-preview-warning" role="status">🧪 Entorno de demostración independiente: recetas y productos ficticios. Nada se guarda en Supabase ni modifica tu Rayku habitual. Los cambios se pierden al recargar.</div>
    {panel === 'calendario' ? <main className="tablet-content">
      <div className="tablet-week-nav"><button onClick={() => setSemana(subWeeks(semana, 1))}>‹</button><h1>{format(inicio, "'Semana del' d 'de' MMMM", { locale: es })}</h1><button onClick={() => setSemana(addWeeks(semana, 1))}>›</button></div>
      <div className="tablet-calendar">{dias.map((dia, i) => <section key={i} className="tablet-day">
        <h2>{format(dia, 'EEEE d', { locale: es })}</h2>
        {(['comida', 'cena'] as const).map((tipo, j) => {
          const plato = RECETAS[(i + j) % RECETAS.length]
          return <div className="tablet-meal" key={tipo}><small>{tipo === 'comida' ? '☀️ Comida' : '🌙 Cena'}</small><button onClick={() => setReceta(plato)}>{plato.nombre}</button></div>
        })}
      </section>)}</div>
      <p className="tablet-hint">Desliza a la izquierda para ver la compra →</p>
    </main> : <main className="tablet-content">
      <h1>🛒 Compra sin escribir</h1>
      <p>Elige un dibujo y después una cantidad. Esta lista es solo una demostración.</p>
      <div className="tablet-categories">{['Todos', 'Carnes', 'Verduras', 'Lácteos', 'Básicos'].map(c => <button key={c} className={categoria === c ? 'tablet-active' : ''} onClick={() => setCategoria(c)}>{c}</button>)}</div>
      <div className="tablet-shopping-summary">🧺 {compra.length} productos en la lista de prueba</div>
      <div className="tablet-products">{PRODUCTOS.filter(p => categoria === 'Todos' || p.categoria === categoria).map(p => <button key={p.nombre} onClick={() => setSeleccion(p)}><span aria-hidden="true">{p.emoji}</span>{p.nombre}</button>)}</div>
      <h2>Tu lista de prueba</h2>
      <div className="tablet-shopping">{compra.length === 0 && <p>Aún no has añadido nada.</p>}{compra.map(item => <div key={item.id}><span>{item.nombre} · {item.cantidad}</span><button onClick={() => setCompra(items => items.filter(i => i.id !== item.id))} aria-label={`Quitar ${item.nombre}`}>✕</button></div>)}</div>
      {confirmacion && <p role="status">{confirmacion}</p>}
      <p className="tablet-hint">← Desliza a la derecha para volver al menú</p>
    </main>}
    {seleccion && <div className="tablet-overlay" role="dialog" aria-modal="true" aria-label="Elegir cantidad"><div className="tablet-dialog"><h2>¿Cuánto necesitas de {seleccion.nombre}?</h2><div className="tablet-quantities">{CANTIDADES.map(c => <button key={c} onClick={() => agregar(c)}>{c}</button>)}</div><button className="btn-secundario" onClick={() => setSeleccion(null)}>Cancelar</button></div></div>}
    {receta && <div className="tablet-overlay" role="dialog" aria-modal="true" aria-label={receta.nombre}><div className="tablet-dialog"><h2>🍽️ {receta.nombre}</h2><h3>Ingredientes</h3><ul>{receta.ingredientes.map(i => <li key={i}>{i}</li>)}</ul><h3>Preparación</h3><p>{receta.pasos}</p><button className="btn-principal" onClick={() => setReceta(null)}>Cerrar</button></div></div>}
  </div>
}
