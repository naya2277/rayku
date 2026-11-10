import {
  useState,
  useEffect,
  useRef,
} from 'react'

import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
} from 'date-fns'

import { es } from 'date-fns/locale'

import {
  useRaykuStore,
} from '../store'

import DiaPlanning from '../components/planning/DiaPlanning'
import AsistenteSemanal from '../components/planning/AsistenteSemanal'
import { cargarPerfilHogar, guardarPerfilHogar } from '../lib/perfilHogar'
import { generarMenuSemanal, recetaPermitida, recetaCompatible, recetaCompatibleHogar } from '../lib/generarMenuSemanal'

const EMOJIS_DIA = [
  '🌸',
  '🧁',
  '💖',
  '🌿',
  '✨',
  '🩷',
  '🎀',
]

const COLORES_DIA = [
  '#ffe4ec',
  '#fff0d9',
  '#efe3ff',
  '#e8f7ea',
  '#ffeaf4',
  '#fce4ec',
  '#e8f4ff',
]

type Props = {
  onAbrirReceta: (
    recetaId: string
  ) => void
}

export default function Planning({
  onAbrirReceta,
}: Props) {
  const [priorizarInventario, setPriorizarInventario] = useState(() => cargarPerfilHogar().priorizarInventario)
  const [propuestas, setPropuestas] = useState<ReturnType<typeof generarMenuSemanal> | null>(null)
  const [seleccion, setSeleccion] = useState<Record<string,string>>({})
  const [nuevoEvitar, setNuevoEvitar] = useState('')
  const [nuevoFavorito, setNuevoFavorito] = useState('')
  const [
    semanaBase,
    setSemanaBase,
  ] = useState(new Date())

  const [
    busquedas,
    setBusquedas,
  ] = useState<
    Record<string, string>
  >({})

  const [
    editandoHuecos,
    setEditandoHuecos,
  ] = useState<
    Record<string, boolean>
  >({})

  const scrollHoyRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const {
    recetas,
    planning,
    inventario,
    preferenciasAlimentarias,
    agregarIngredienteProhibido,
    eliminarIngredienteProhibido,
    agregarIngredienteFavorito,
    eliminarIngredienteFavorito,
    guardarHuecoPlanning,
    limpiarHuecoPlanning,
    toggleCocinadoPlanning,
    updateReceta,
  } = useRaykuStore()

  const inicioSemana =
    startOfWeek(
      semanaBase,
      {
        weekStartsOn: 1,
      }
    )

  const dias =
    Array.from(
      { length: 7 },
      (_, i) =>
        addDays(
          inicioSemana,
          i
        )
    )

  function aplazarComida(
    fecha: string, tipo: 'comida' | 'cena',
    nuevaFecha: string, nuevoTipo: 'comida' | 'cena',
    destino: 'intercambiar' | 'mover' | 'cancelar',
    fechaDesplazada?: string, tipoDesplazado?: 'comida' | 'cena',
  ) {
    const estado = useRaykuStore.getState()
    const origen = estado.planning.find(p => p.fecha === fecha && p.tipoComida === tipo)
    const ocupado = estado.planning.find(p => p.fecha === nuevaFecha && p.tipoComida === nuevoTipo)
    if (!origen || origen.cocinado || !nuevaFecha || nuevaFecha < fecha ||
      (fecha === nuevaFecha && tipo === nuevoTipo) || ocupado?.cocinado) return false
    if (ocupado && destino === 'mover') {
      if (!fechaDesplazada || !tipoDesplazado ||
        (fechaDesplazada === nuevaFecha && tipoDesplazado === nuevoTipo) ||
        (fechaDesplazada === fecha && tipoDesplazado === tipo) ||
        estado.planning.some(p => p.fecha === fechaDesplazada && p.tipoComida === tipoDesplazado)) return false
    }
    // Clear both original slots first so moving meals never silently merges their contents.
    estado.limpiarHuecoPlanning(fecha, tipo)
    if (ocupado) estado.limpiarHuecoPlanning(nuevaFecha, nuevoTipo)
    if (ocupado && destino !== 'cancelar') {
      const desplazado = destino === 'intercambiar'
        ? { fecha, tipoComida: tipo }
        : { fecha: fechaDesplazada!, tipoComida: tipoDesplazado! }
      estado.guardarHuecoPlanning({ ...ocupado, ...desplazado })
    }
    estado.guardarHuecoPlanning({ ...origen, fecha: nuevaFecha, tipoComida: nuevoTipo })
    return true
  }

  function sugerirSemana() {
    const resultado = generarMenuSemanal(dias.map(d => format(d, 'yyyy-MM-dd')), recetas, planning, preferenciasAlimentarias, inventario, cargarPerfilHogar(), priorizarInventario)
    setPropuestas(resultado)
    setSeleccion(Object.fromEntries(resultado.propuestas.map(p => [p.fecha + p.tipoComida, p.recetaId])))
  }
  function cambiarSemana(nueva: Date) { setSemanaBase(nueva); setPropuestas(null) }
  function aceptarSemana() {
    if (!propuestas) return
    const actual = useRaykuStore.getState()
    const hogar = cargarPerfilHogar()
    for (const p of propuestas.propuestas) {
      const id = seleccion[p.fecha + p.tipoComida]
      if (!id || actual.planning.some(h => h.fecha === p.fecha && h.tipoComida === p.tipoComida)) continue
      const receta = actual.recetas.find(r=>r.id===id)
      if (!receta || !recetaCompatible(receta,p.tipoComida) || !recetaPermitida(receta,actual.preferenciasAlimentarias) || !recetaCompatibleHogar(receta,hogar)) continue
      actual.guardarHuecoPlanning({ fecha: p.fecha, tipoComida: p.tipoComida, recetaId: id, recetaIds: [id], comidaLibre: '', nota: '', cocinado: false })
    }
    setPropuestas(null)
  }
  function rechazarReceta(id: string) {
    const hogar = cargarPerfilHogar()
    const persona = hogar.personas[0]
    if (!persona) return
    guardarPerfilHogar({...hogar, personas: hogar.personas.map(p=>p.id===persona.id?{...p,rechazadas:[...new Set([...p.rechazadas,id])]}:p)})
    setPropuestas(null)
  }

  const hoy = format(
    new Date(),
    'yyyy-MM-dd'
  )

  useEffect(() => {
    setTimeout(() => {
      scrollHoyRef.current?.scrollIntoView(
        {
          behavior: 'smooth',
          block: 'start',
        }
      )
    }, 150)
  }, [])

  const activarEdicion = (
    clave: string
  ) => {
    setEditandoHuecos(
      (actual) => ({
        ...actual,
        [clave]: true,
      })
    )
  }

  const cerrarEdicion = (
    clave: string
  ) => {
    setEditandoHuecos(
      (actual) => ({
        ...actual,
        [clave]: false,
      })
    )
  }

  const setBusqueda = (
    clave: string,
    valor: string
  ) => {
    setBusquedas(
      (actual) => ({
        ...actual,
        [clave]: valor,
      })
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          marginBottom:
            '20px',
          flexWrap:
            'wrap',
          gap: '12px',
        }}
      >
        <button
          className="btn-secundario"
          onClick={() =>
            cambiarSemana(
              subWeeks(
                semanaBase,
                1
              )
            )
          }
        >
          ← Semana anterior
        </button>

        <h2
          style={{
            fontSize:
              '20px',
            color:
              '#c77d95',
            textAlign:
              'center',
          }}
        >
          🗓️{' '}
          {format(
            inicioSemana,
            "'Semana del' d 'de' MMMM",
            {
              locale: es,
            }
          )}
        </h2>

        <button
          className="btn-secundario"
          onClick={() =>
            cambiarSemana(
              addWeeks(
                semanaBase,
                1
              )
            )
          }
        >
          Semana siguiente →
        </button>
      </div>

      <AsistenteSemanal planning={planning} recetas={recetas} inventario={inventario} desde={format(dias[0], 'yyyy-MM-dd')} hasta={format(dias[6], 'yyyy-MM-dd')} onAbrirReceta={onAbrirReceta}/>
      <section className="card" style={{ padding: 18, marginBottom: 20 }}>
        <h3>✨ Propuestas de Rayku</h3>
        <details style={{ marginBottom: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>💜 Preferencias del menú</summary>
          <p>Los ingredientes que evites se excluirán de las propuestas. Tus favoritos tendrán prioridad.</p>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <strong>🚫 Ingredientes que evito</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0' }}>
                {preferenciasAlimentarias.ingredientesProhibidos.map(i => <button type="button" className="btn-secundario" key={i} onClick={() => { eliminarIngredienteProhibido(i); setPropuestas(null) }}>{i} ✕</button>)}
              </div>
              <form onSubmit={e => { e.preventDefault(); agregarIngredienteProhibido(nuevoEvitar); setNuevoEvitar(''); setPropuestas(null) }} style={{ display: 'flex', gap: 8 }}>
                <input aria-label="Ingrediente que evito" placeholder="Ej.: cebolla" value={nuevoEvitar} onChange={e => setNuevoEvitar(e.target.value)} style={{ flex: 1, minWidth: 0, padding: 10 }} />
                <button type="submit" className="btn-secundario" disabled={!nuevoEvitar.trim()}>Añadir</button>
              </form>
            </div>
            <div>
              <strong>💕 Ingredientes favoritos</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0' }}>
                {preferenciasAlimentarias.ingredientesFavoritos.map(i => <button type="button" className="btn-secundario" key={i} onClick={() => { eliminarIngredienteFavorito(i); setPropuestas(null) }}>{i} ✕</button>)}
              </div>
              <form onSubmit={e => { e.preventDefault(); agregarIngredienteFavorito(nuevoFavorito); setNuevoFavorito(''); setPropuestas(null) }} style={{ display: 'flex', gap: 8 }}>
                <input aria-label="Ingrediente favorito" placeholder="Ej.: salmón" value={nuevoFavorito} onChange={e => setNuevoFavorito(e.target.value)} style={{ flex: 1, minWidth: 0, padding: 10 }} />
                <button type="submit" className="btn-secundario" disabled={!nuevoFavorito.trim()}>Añadir</button>
              </form>
            </div>
          </div>
        </details>
        <p>Revisa el menú sugerido. No se cambiará nada hasta que lo confirmes.</p>
        <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}><input type="checkbox" style={{width:'auto'}} checked={priorizarInventario} onChange={e=>{setPriorizarInventario(e.target.checked);setPropuestas(null)}}/> 🧺 Priorizar lo que ya tengo en casa</label>
        <button className="btn-principal" onClick={sugerirSemana}>✨ Proponer menú semanal</button>
        {propuestas && <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {propuestas.propuestas.map(p => <label key={p.fecha + p.tipoComida}>
            <strong>{p.fecha} · {p.tipoComida}</strong>
            <select style={{ display: 'block', width: '100%', padding: 10 }} value={seleccion[p.fecha + p.tipoComida] ?? ''} onChange={e => setSeleccion(prev => ({ ...prev, [p.fecha + p.tipoComida]: e.target.value }))}>
              <option value="">Dejar sin planificar</option>
              {recetas.filter(r => recetaPermitida(r, preferenciasAlimentarias) && recetaCompatible(r, p.tipoComida) && recetaCompatibleHogar(r,cargarPerfilHogar())).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            {seleccion[p.fecha + p.tipoComida] && <button type="button" className="btn-secundario" onClick={()=>rechazarReceta(seleccion[p.fecha + p.tipoComida])}>👎 No me gusta esta receta</button>}
          </label>)}
          {propuestas.sinCubrir.length > 0 && <p>{propuestas.sinCubrir.length} huecos sin recetas compatibles.</p>}
          <button className="btn-principal" onClick={aceptarSemana}>💜 Confirmar propuestas</button>
          <button className="btn-secundario" onClick={() => setPropuestas(null)}>Cancelar</button>
        </div>}
      </section>
      <div
        style={{
          display: 'grid',
          gap: '18px',
        }}
      >
        {dias.map(
          (dia, i) => {
            const fecha =
              format(
                dia,
                'yyyy-MM-dd'
              )

            const esHoy =
              fecha === hoy

            return (
              <div
                key={fecha}
                ref={
                  esHoy
                    ? scrollHoyRef
                    : undefined
                }
              >
                <DiaPlanning
                  dia={dia}
                  indice={i}
                  esHoy={esHoy}
                  emojiDia={
                    EMOJIS_DIA[i]
                  }
                  colorDia={
                    COLORES_DIA[i]
                  }
                  recetas={recetas}
                  planning={planning}
                  inventario={inventario}
                  busquedas={
                    busquedas
                  }
                  editandoHuecos={
                    editandoHuecos
                  }
                  onAbrirReceta={
                    onAbrirReceta
                  }
                  activarEdicion={
                    activarEdicion
                  }
                  cerrarEdicion={
                    cerrarEdicion
                  }
                  setBusqueda={
                    setBusqueda
                  }
                  guardarHuecoPlanning={
                    guardarHuecoPlanning
                  }
                  limpiarHuecoPlanning={
                    limpiarHuecoPlanning
                  }
                  toggleCocinadoPlanning={
                    toggleCocinadoPlanning
                  }
                  updateReceta={
                    updateReceta
                  }
                  onAplazar={aplazarComida}
                />
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}