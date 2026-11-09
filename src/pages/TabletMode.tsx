import { useRef, useState } from 'react'
import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRaykuStore } from '../store'
import './TabletMode.css'

const PRODUCTOS = [
  ['🍗','Muslitos de pollo'],['🥩','Pechuga de pollo'],['🍅','Tomates'],
  ['🥔','Patatas'],['🥚','Huevos'],['🥛','Leche'],['🍚','Arroz'],
  ['🍝','Macarrones'],['🥕','Zanahorias'],['🥦','Brócoli'],
  ['🐟','Salmón'],['🧀','Queso'],['🍎','Manzanas'],['🍞','Pan'],
] as const
const CANTIDADES = ['1 unidad', '2 unidades', '500 g', '1 kg', '1 paquete', '2 paquetes']

type Props = { onSalir: () => void }

export default function TabletMode({ onSalir }: Props) {
  const { planning, recetas, compraManual, agregarItemCompraManual, eliminarItemCompraManual } = useRaykuStore()
  const [panel, setPanel] = useState<'calendario' | 'compra'>('calendario')
  const [semana, setSemana] = useState(new Date())
  const [recetaId, setRecetaId] = useState<string | null>(null)
  const [producto, setProducto] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState('')
  const inicio = startOfWeek(semana, { weekStartsOn: 1 })
  const touchX = useRef<number | null>(null)
  const receta = recetas.find(r => r.id === recetaId)
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicio, i))

  function agregar(cantidad: string) {
    if (!producto) return
    agregarItemCompraManual({ id: '', nombre: producto, cantidad })
    setConfirmacion(`${producto} · ${cantidad} añadido a la compra`)
    setProducto(null)
  }

  return (
    <div className="tablet-mode"
      onTouchStart={e => { touchX.current = e.touches[0]?.clientX ?? null }}
      onTouchEnd={e => {
        const final = e.changedTouches[0]?.clientX
        if (touchX.current === null || final === undefined || recetaId || producto) return
        const distancia = final - touchX.current
        if (Math.abs(distancia) > 90) setPanel(distancia < 0 ? 'compra' : 'calendario')
        touchX.current = null
      }}>
      <header className="tablet-header">
        <strong>💜 Rayku · Modo tablet</strong>
        <nav aria-label="Pantallas del modo tablet">
          <button className={panel === 'calendario' ? 'tablet-active' : ''} onClick={() => setPanel('calendario')}>📅 Menú</button>
          <button className={panel === 'compra' ? 'tablet-active' : ''} onClick={() => setPanel('compra')}>🛒 Compra ({compraManual.length})</button>
          <button onClick={onSalir}>✕ Salir</button>
        </nav>
      </header>
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
          <p>Toca un producto y elige la cantidad.</p>
          <div className="tablet-products">
            {PRODUCTOS.map(([emoji, nombre]) =>
              <button key={nombre} onClick={() => setProducto(nombre)}>
                <span aria-hidden="true">{emoji}</span>{nombre}
              </button>
            )}
          </div>
          <h2>Lista de compra</h2>
          <div className="tablet-shopping">
            {compraManual.length === 0 && <p>La lista está vacía.</p>}
            {compraManual.map(item => <div key={item.id}>
              <span>{item.nombre} {item.cantidad ? '· ' + item.cantidad : ''}</span>
              <button aria-label={`Quitar ${item.nombre}`} onClick={() => eliminarItemCompraManual(item.id)}>✕</button>
            </div>)}
          </div>
          {confirmacion && <p role="status">{confirmacion}</p>}
          <p className="tablet-hint">← Desliza a la derecha para volver al menú</p>
        </main>
      )}
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
