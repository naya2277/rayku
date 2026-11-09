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
import { generarMenuSemanal } from '../lib/generarMenuSemanal'

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
  const [propuestas, setPropuestas] = useState<ReturnType<typeof generarMenuSemanal> | null>(null)
  const [seleccion, setSeleccion] = useState<Record<string,string>>({})
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

  function sugerirSemana() {
    const resultado = generarMenuSemanal(dias.map(d => format(d, 'yyyy-MM-dd')), recetas, planning, preferenciasAlimentarias)
    setPropuestas(resultado)
    setSeleccion(Object.fromEntries(resultado.propuestas.map(p => [p.fecha + p.tipoComida, p.recetaId])))
  }
  function aceptarSemana() {
    if (!propuestas) return
    for (const p of propuestas.propuestas) {
      const id = seleccion[p.fecha + p.tipoComida]
      if (id) guardarHuecoPlanning({ fecha: p.fecha, tipoComida: p.tipoComida, recetaId: id, recetaIds: [id], comidaLibre: '', nota: '', cocinado: false })
    }
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
            setSemanaBase(
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
            setSemanaBase(
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

      <section className="card" style={{ padding: 18, marginBottom: 20 }}>
        <h3>✨ Propuestas de Rayku</h3>
        <p>Revisa el menú sugerido. No se cambiará nada hasta que lo confirmes.</p>
        <button className="btn-principal" onClick={sugerirSemana}>✨ Proponer menú semanal</button>
        {propuestas && <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {propuestas.propuestas.map(p => <label key={p.fecha + p.tipoComida}>
            <strong>{p.fecha} · {p.tipoComida}</strong>
            <select style={{ display: 'block', width: '100%', padding: 10 }} value={seleccion[p.fecha + p.tipoComida] ?? ''} onChange={e => setSeleccion(prev => ({ ...prev, [p.fecha + p.tipoComida]: e.target.value }))}>
              <option value="">Dejar sin planificar</option>
              {recetas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
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
                />
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}