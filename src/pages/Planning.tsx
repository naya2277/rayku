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
import PlatosPersonales from '../components/planning/PlatosPersonales'
import SustituirPlato from '../components/planning/SustituirPlato'
import AdvertenciasPersonales from '../components/planning/AdvertenciasPersonales'
import AsistenteSemanal from '../components/planning/AsistenteSemanal'
import { cargarPerfilHogar, guardarPerfilHogar } from '../lib/perfilHogar'
import { generarPropuestasHogar, validarPropuestaHogar } from '../lib/propuestasMenu'
import { readFoodProfiles, type FoodProfile } from '../lib/foodProfiles'
import type { ItemPlanning } from '../store/types'
import { calcularPresupuesto, type Precios } from '../lib/planificacionInteligente'

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
  householdId?: string
  onAbrirReceta: (
    recetaId: string
  ) => void
}

export default function Planning({
  householdId,
  onAbrirReceta,
}: Props) {
  const [priorizarInventario, setPriorizarInventario] = useState(() => cargarPerfilHogar().priorizarInventario)
  const [propuestas, setPropuestas] = useState<ReturnType<typeof generarPropuestasHogar> | null>(null)
  const [seleccion, setSeleccion] = useState<Record<string,string>>({})
  const [perfilesHogar,setPerfilesHogar] = useState<FoodProfile[]>([])
  const [estadoPerfiles,setEstadoPerfiles] = useState<'loading'|'ready'|'error'>('loading')
  const [minutosMaximos,setMinutosMaximos] = useState(()=>{
    const valor=Number(localStorage.getItem('rayku-menu-tiempo-v1'))
    return Number.isFinite(valor) && valor>0 ? valor : 45
  })
  const [presupuestoMaximo,setPresupuestoMaximo] = useState(()=>{
    const valor=Number(localStorage.getItem('rayku-menu-presupuesto-v1'))
    return Number.isFinite(valor) && valor>0 ? valor : 90
  })
  const [limitesPorFecha,setLimitesPorFecha] = useState<Record<string,number>>(()=>{
    try{
      const valor=JSON.parse(localStorage.getItem('rayku-menu-dias-v1')??'{}')
      return valor && typeof valor==='object' && !Array.isArray(valor) ? valor : {}
    }catch{return {}}
  })
  const [nuevoEvitar, setNuevoEvitar] = useState('')
  const [avisoGeneracion, setAvisoGeneracion] = useState('')
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

  useEffect(()=>{localStorage.setItem('rayku-menu-tiempo-v1',String(minutosMaximos))},[minutosMaximos])
  useEffect(()=>{localStorage.setItem('rayku-menu-presupuesto-v1',String(presupuestoMaximo))},[presupuestoMaximo])
  useEffect(()=>{localStorage.setItem('rayku-menu-dias-v1',JSON.stringify(limitesPorFecha))},[limitesPorFecha])

  useEffect(()=>{
    if(!householdId) {setPerfilesHogar([]);setEstadoPerfiles('ready');return}
    let active=true
    const cargar=async()=>{
      setEstadoPerfiles('loading')
      try{
        const perfiles=await readFoodProfiles(householdId)
        if(!active)return
        setPerfilesHogar(perfiles)
        setEstadoPerfiles('ready')
        setPropuestas(null)
      }catch(error){
        console.warn('No se pudieron cargar perfiles alimentarios',error)
        if(active)setEstadoPerfiles('error')
      }
    }
    void cargar()
    window.addEventListener('rayku-food-profiles-updated',cargar)
    return()=>{active=false;window.removeEventListener('rayku-food-profiles-updated',cargar)}
  },[householdId])

  const presupuestoPropuesto = (() => {
    if(!propuestas)return null
    let precios:Precios={}
    try{precios=JSON.parse(localStorage.getItem('rayku-precios-local-v1')??'{}') as Precios}catch{precios={}}
    const borrador:ItemPlanning[] = propuestas.propuestas.flatMap(p=>{
      const id=seleccion[p.fecha+'|'+p.tipoComida]
      return id ? [{id:'preview-'+p.fecha+p.tipoComida,fecha:p.fecha,tipoComida:p.tipoComida,recetaId:id,recetaIds:[id],comidaLibre:'',nota:'',cocinado:false}] : []
    })
    return calcularPresupuesto([...planning,...borrador],recetas,inventario,
      format(dias[0],'yyyy-MM-dd'),format(dias[6],'yyyy-MM-dd'),precios)
  })()


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

  async function sugerirSemana() {
    setAvisoGeneracion('')
    let perfiles=perfilesHogar
    if(householdId) {
      try {
        perfiles=await readFoodProfiles(householdId)
        if(perfiles.length<2){
          setAvisoGeneracion('Para proponer un menú compartido deben estar disponibles los perfiles alimentarios de los dos miembros.')
          return
        }
        setPerfilesHogar(perfiles)
        setEstadoPerfiles('ready')
      } catch {
        setAvisoGeneracion('No se pueden comprobar las restricciones del hogar. No se ha generado ni guardado ningún menú.')
        return
      }
    }
    const resultado=generarPropuestasHogar(dias.map(d=>format(d,'yyyy-MM-dd')),
      recetas,planning,inventario,perfiles,preferenciasAlimentarias,
      cargarPerfilHogar(),minutosMaximos,priorizarInventario,limitesPorFecha)
    setPropuestas(resultado)
    setSeleccion(Object.fromEntries(resultado.propuestas.map(p=>[p.fecha+'|'+p.tipoComida,p.recetaId])))
    setAvisoGeneracion(resultado.propuestas.length
      ? 'Estas son propuestas. Nada se guardará en el calendario hasta que las confirmes.'
      : 'No hay recetas compatibles para los huecos libres. Puedes ajustar el tiempo máximo o las recetas disponibles.')
  }
  function cambiarSemana(nueva: Date) { setSemanaBase(nueva); setPropuestas(null) }
  function aceptarSemana() {
    if(!propuestas)return
    if(householdId && estadoPerfiles!=='ready') {
      setAvisoGeneracion('No se puede confirmar sin comprobar los perfiles alimentarios del hogar.')
      return
    }
    const presupuestoIncompleto=(presupuestoPropuesto?.sinPrecio??0)>0
    const supera=(presupuestoPropuesto?.estimado??0)>presupuestoMaximo
    if(supera || presupuestoIncompleto){
      const aviso=supera
        ? 'La estimación supera el presupuesto indicado.'
        : 'No se puede garantizar el presupuesto porque faltan precios de referencia.'
      if(!window.confirm(aviso+' ¿Quieres confirmar igualmente las recetas seleccionadas?'))return
    }
    const actual=useRaykuStore.getState()
    const hogar=cargarPerfilHogar()
    let aceptadas=0
    for(const p of propuestas.propuestas){
      const id=seleccion[p.fecha+'|'+p.tipoComida]
      if(!id || actual.planning.some(h=>h.fecha===p.fecha && h.tipoComida===p.tipoComida))continue
      const receta=actual.recetas.find(r=>r.id===id)
      if(!receta || !validarPropuestaHogar(receta,p.tipoComida,propuestas.restricciones,hogar,limitesPorFecha[p.fecha]??minutosMaximos))continue
      actual.guardarHuecoPlanning({
        fecha:p.fecha,tipoComida:p.tipoComida,recetaId:id,recetaIds:[id],
        comidaLibre:'',nota:'',cocinado:false
      })
      aceptadas++
    }
    setPropuestas(null)
    setAvisoGeneracion(aceptadas
      ? 'Has confirmado '+aceptadas+' platos. Ahora aparecen en el calendario compartido.'
      : 'No se añadió ningún plato: los huecos estaban ocupados o ya no eran compatibles.')
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
        <details style={{ marginBottom: 14, display: householdId ? 'none' : undefined }}>
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
        <p>Rayku propone comidas para los huecos libres. Revisa o cambia cada propuesta antes de confirmarla; nunca modifica el calendario por sí solo.</p>
        <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}><input type="checkbox" style={{width:'auto'}} checked={priorizarInventario} onChange={e=>{setPriorizarInventario(e.target.checked);setPropuestas(null)}}/> 🧺 Priorizar lo que ya tengo en casa</label>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:12}}>
          <label>⏱️ Tiempo máximo por receta
            <select value={minutosMaximos} onChange={e=>{setMinutosMaximos(Number(e.target.value));setPropuestas(null)}}>
              {[15,20,30,45,60,90,120,240].map(n=><option key={n} value={n}>{n} min</option>)}
            </select>
          </label>
          <label>💶 Presupuesto máximo semanal (€)
            <input type="number" min="1" step="1" value={presupuestoMaximo}
              onChange={e=>setPresupuestoMaximo(Math.max(1,Number(e.target.value)||1))}/>
          </label>
        </div>
        <details style={{marginBottom:12}}>
          <summary>📅 ¿Algún día tenéis menos tiempo para cocinar?</summary>
          <p style={{fontSize:13}}>Estos límites se aplican solo al día elegido; el resto utiliza el tiempo general.</p>
          <div style={{display:'grid',gap:8,marginTop:10}}>
            {dias.map(fecha=>{
              const id=format(fecha,'yyyy-MM-dd')
              return <label key={id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                {format(fecha,'EEEE d',{locale:es})}
                <select style={{maxWidth:160}} value={limitesPorFecha[id]??''}
                  onChange={e=>{
                    setLimitesPorFecha(actual=>{
                      const next={...actual}
                      if(e.target.value)next[id]=Number(e.target.value)
                      else delete next[id]
                      return next
                    })
                    setPropuestas(null)
                  }}>
                  <option value="">Tiempo general</option>
                  {[15,20,30,45,60,90,120].map(n=><option key={n} value={n}>{n} minutos</option>)}
                </select>
              </label>
            })}
          </div>
        </details>
        {householdId && <p style={{fontSize:13}}>
          {estadoPerfiles==='loading'?'Comprobando preferencias de ambos miembros…':
            estadoPerfiles==='error'?'No se pudieron cargar los perfiles del hogar.':
            'Perfiles alimentarios disponibles: '+perfilesHogar.length+'. Las restricciones conocidas de ambos se aplican a las propuestas.'}
        </p>}
        <button className="btn-principal" disabled={Boolean(householdId) && estadoPerfiles!=='ready'}
          onClick={()=>{void sugerirSemana()}}>✨ Proponer menú sin guardar</button>
        {avisoGeneracion && <p role="status">{avisoGeneracion}</p>}
        {propuestas && <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {propuestas.propuestas.map(p => <label key={p.fecha + '|' + p.tipoComida}>
            <strong>{p.fecha} · {p.tipoComida}</strong>
            <select style={{ display: 'block', width: '100%', padding: 10 }} value={seleccion[p.fecha + '|' + p.tipoComida] ?? ''} onChange={e => setSeleccion(prev => ({ ...prev, [p.fecha + '|' + p.tipoComida]: e.target.value }))}>
              <option value="">Dejar sin planificar</option>
              {propuestas.elegibles.filter(r => validarPropuestaHogar(r,p.tipoComida,propuestas.restricciones,cargarPerfilHogar(),limitesPorFecha[p.fecha]??minutosMaximos)).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            {seleccion[p.fecha + p.tipoComida] && <button type="button" className="btn-secundario" onClick={()=>rechazarReceta(seleccion[p.fecha + p.tipoComida])}>👎 No me gusta esta receta</button>}
          </label>)}
          {presupuestoPropuesto && <p style={{padding:12,border:'1px solid var(--borde)',borderRadius:12}}>
            💶 Compra estimada con los precios introducidos: <strong>{presupuestoPropuesto.estimado.toFixed(2)} €</strong>
            {' '}de {presupuestoMaximo.toFixed(2)} € de presupuesto semanal.
            {presupuestoPropuesto.sinPrecio>0 && <span> ⚠️ Faltan precios de {presupuestoPropuesto.sinPrecio} productos; el coste real puede ser mayor.</span>}
            {presupuestoPropuesto.estimado>presupuestoMaximo && <span> ⚠️ Se supera el presupuesto.</span>}
          </p>}
          <p style={{fontSize:12}}>Las coincidencias por ingredientes no garantizan seguridad frente a alergias. Revisa ingredientes, etiquetas y posibles trazas antes de preparar cada plato.</p>
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
                {planning.filter(item=>item.fecha===fecha).map(item=><section className="card" key={item.id} style={{marginTop:8,padding:12}}><strong>{item.tipoComida === 'comida' ? '🍽️ Comida' : '🌙 Cena'}</strong><AdvertenciasPersonales item={item} householdId={householdId}/><SustituirPlato item={item}/><PlatosPersonales item={item}/></section>)}
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}