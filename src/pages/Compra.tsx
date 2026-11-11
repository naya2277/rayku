import {
  useMemo,
  useState,
} from 'react'

import {
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns'

import { useRaykuStore } from '../store'

import {
  generarIngredientesCompra,
  agruparIngredientesCompra,
  separarIngredientesPorInventario,
  type IngredienteCompra,
} from '../lib/generarListaCompra'

import FormularioCompraManual from '../components/compra/FormularioCompraManual'
import { planificarCompraPorConservacion } from '../lib/compra/planificarCompraPorConservacion'
import { obtenerClaveIngredienteCompra } from '../lib/compra/normalizacionCompra'
import { compraManualParaInventario } from '../lib/compra/manualCheckout'
import ResumenCompra from '../components/compra/ResumenCompra'
import GrupoCompra from '../components/compra/GrupoCompra'
import ModoSupermercado from '../components/compra/ModoSupermercado'

type ModoRangoCompra =
  | 'desdeHoy'
  | 'semana'
  | 'personalizado'

function estaEnRango(
  fecha: string,
  inicio: Date,
  fin: Date
) {
  const fechaPlanning =
    startOfDay(parseISO(fecha))

  return isWithinInterval(
    fechaPlanning,
    {
      start: startOfDay(inicio),
      end: startOfDay(fin),
    }
  )
}

function obtenerRangoPorDefecto() {
  const hoy =
    startOfDay(new Date())

  return {
    desde: format(hoy, 'yyyy-MM-dd'),
    hasta: format(
      endOfWeek(hoy, {
        weekStartsOn: 1,
      }),
      'yyyy-MM-dd'
    ),
  }
}

export default function Compra() {
  const {
    planning,
    recetas,
    inventario,
    compraManual,
    agregarItemCompraManual,
    eliminarItemCompraManual,
    checksCompra,
    toggleCheckCompra,
    finalizarCompra,
  } = useRaykuStore()

  const rangoPorDefecto =
    obtenerRangoPorDefecto()

  const [
    mostrarComprados,
    setMostrarComprados,
  ] = useState(false)

  const [
    modoSupermercado,
    setModoSupermercado,
  ] = useState(false)

  const [
    modoRango,
    setModoRango,
  ] =
    useState<ModoRangoCompra>(
      'desdeHoy'
    )

  const [
    fechaDesde,
    setFechaDesde,
  ] = useState(
    rangoPorDefecto.desde
  )

  const [
    fechaHasta,
    setFechaHasta,
  ] = useState(
    rangoPorDefecto.hasta
  )

  const rangoCompra =
    useMemo(() => {
      const hoy =
        startOfDay(new Date())

      if (modoRango === 'semana') {
        return {
          inicio:
            startOfWeek(hoy, {
              weekStartsOn: 1,
            }),
          fin:
            endOfWeek(hoy, {
              weekStartsOn: 1,
            }),
          texto:
            'semana actual completa',
        }
      }

      if (modoRango === 'personalizado') {
        const inicio =
          startOfDay(
            parseISO(fechaDesde)
          )

        const fin =
          startOfDay(
            parseISO(fechaHasta)
          )

        return {
          inicio,
          fin,
          texto: `del ${fechaDesde} al ${fechaHasta}`,
        }
      }

      return {
        inicio: hoy,
        fin:
          endOfWeek(hoy, {
            weekStartsOn: 1,
          }),
        texto:
          'desde hoy hasta final de semana',
      }
    }, [
      modoRango,
      fechaDesde,
      fechaHasta,
    ])

  const planningFiltrado =
    useMemo(() => {
      return planning.filter(
        (item) =>
          estaEnRango(
            item.fecha,
            rangoCompra.inicio,
            rangoCompra.fin
          ) &&
          !item.cocinado
      )
    }, [planning, rangoCompra])

  const comprasPorFecha = useMemo(() =>
    planificarCompraPorConservacion(planningFiltrado,recetas,new Date()),
    [planningFiltrado,recetas]
  )
  const ingredientes = comprasPorFecha.ahora
  const comprasPosteriores = comprasPorFecha.despues

  const usosPorIngrediente = useMemo(() => {
    const usos = new Map<string, { fecha: string; receta: string }[]>()
    for (const hueco of [...planningFiltrado].sort((a,b)=>a.fecha.localeCompare(b.fecha))) {
      const ids = hueco.recetaIds?.length ? hueco.recetaIds : hueco.recetaId ? [hueco.recetaId] : []
      for (const id of ids) {
        const receta = recetas.find(r=>r.id===id)
        if (!receta) continue
        for (const ingrediente of generarIngredientesCompra([{...hueco,recetaIds:[id],recetaId:id,comidaLibre:''}],[receta])) {
          const clave = obtenerClaveIngredienteCompra(ingrediente.nombre)
          usos.set(clave,[...(usos.get(clave)??[]),{fecha:hueco.fecha,receta:receta.nombre}])
        }
      }
    }
    return usos
  },[planningFiltrado,recetas])

  const itemsManualesComoCompra =
    useMemo<IngredienteCompra[]>(
      () =>
        compraManual.map(
          (item) => ({
            clave: `manual-${item.id}`,
            nombre:
              item.cantidad
                ? `${item.nombre} (${item.cantidad})`
                : item.nombre,
            veces: 1,
            cantidad: null,
            unidad: null,
            cantidadDisponible: null,
            cantidadFaltante: null,
          })
        ),
      [compraManual]
    )

  const ingredientesConManuales =
    useMemo(
      () => [
        ...ingredientes,
        ...itemsManualesComoCompra,
      ],
      [
        ingredientes,
        itemsManualesComoCompra,
      ]
    )

  const {
    paraComprar,
    yaDisponibles,
  } = useMemo(() => {
    // Do not count stock that reaches its printed expiry before the planned meal.
    // Manual entries do not have a date and retain the usual inventory rules.
    const requiredBy = new Map(ingredientes.map(i=>[i.clave,i.primeraUtilizacion]))
    const inventarioVigente = inventario.filter(item=>{
      if(!item.fechaCaducidad) return true
      const uso = requiredBy.get(obtenerClaveIngredienteCompra(item.nombre))
      return !uso || item.fechaCaducidad >= uso
    })
    return separarIngredientesPorInventario(
      ingredientesConManuales,
      inventarioVigente
    )
  }, [ingredientesConManuales, inventario, ingredientes])

  const esItemComprado = (
    item: IngredienteCompra
  ) => {
    const manual =
      compraManual.find(
        (manualItem) =>
          item.clave ===
          `manual-${manualItem.id}`
      )

    const idCheck =
      manual
        ? `manual-${manual.id}`
        : item.clave

    return checksCompra.includes(
      idCheck
    )
  }

  const paraComprarVisibles =
    useMemo(() => {
      if (mostrarComprados) {
        return paraComprar
      }

      return paraComprar.filter(
        (item) =>
          !esItemComprado(item)
      )
    }, [
      paraComprar,
      mostrarComprados,
      checksCompra,
      compraManual,
    ])

  const confirmarCompra = () => {
    const comprados = paraComprar
      .filter(item => checksCompra.includes(item.clave))
      .map(item => {
        const manual = compraManual.find(m => item.clave === `manual-${m.id}`)
        if (manual) return compraManualParaInventario(manual)
        return {
          nombre: item.nombre,
          cantidad: item.cantidadFaltante ?? item.cantidad,
          unidad: item.unidad,
        }
      })
    finalizarCompra(comprados)
  }

  const compradosOcultos =
    paraComprar.length -
    paraComprarVisibles.length

  const agrupadosComprar =
    useMemo(() => {
      return agruparIngredientesCompra(
        paraComprarVisibles
      )
    }, [paraComprarVisibles])

  const agrupadosDisponibles =
    useMemo(() => {
      return agruparIngredientesCompra(
        yaDisponibles
      )
    }, [yaDisponibles])

  const totalCompra =
    paraComprarVisibles.length

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1>🛒 Compra</h1>

          <p
            style={{
              color: '#9e7d90',
            }}
          >
            Lista inteligente {rangoCompra.texto} + extras manuales 💕 Los frescos se programan según su día de uso.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className={
              modoSupermercado
                ? 'btn-principal'
                : 'btn-secundario'
            }
            onClick={() =>
              setModoSupermercado(
                (actual) =>
                  !actual
              )
            }
          >
            {modoSupermercado
              ? '🛒 Vista normal'
              : '🛍️ Modo supermercado'}
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setMostrarComprados(
                (actual) =>
                  !actual
              )
            }
          >
            {mostrarComprados
              ? '🙈 Ocultar comprados'
              : '👁️ Mostrar comprados'}
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 18,
          background:
            'linear-gradient(135deg, #fffafc, #f7f0ff)',
          borderColor: '#f5dde8',
          color: '#8f7080',
          fontWeight: 800,
          display: 'grid',
          gap: 12,
        }}
      >
        <div>
          📅 Elige qué días del planning quieres calcular para la compra.
          Las comidas ya cocinadas no se incluyen.
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <button
            type="button"
            className={
              modoRango === 'desdeHoy'
                ? 'btn-principal'
                : 'btn-secundario'
            }
            onClick={() =>
              setModoRango(
                'desdeHoy'
              )
            }
          >
            📍 Desde hoy
          </button>

          <button
            type="button"
            className={
              modoRango === 'semana'
                ? 'btn-principal'
                : 'btn-secundario'
            }
            onClick={() =>
              setModoRango(
                'semana'
              )
            }
          >
            🗓️ Semana completa
          </button>

          <button
            type="button"
            className={
              modoRango === 'personalizado'
                ? 'btn-principal'
                : 'btn-secundario'
            }
            onClick={() =>
              setModoRango(
                'personalizado'
              )
            }
          >
            ✨ Personalizado
          </button>
        </div>

        {modoRango === 'personalizado' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 10,
            }}
          >
            <label
              style={{
                display: 'grid',
                gap: 6,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Desde
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) =>
                  setFechaDesde(
                    e.target.value
                  )
                }
              />
            </label>

            <label
              style={{
                display: 'grid',
                gap: 6,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Hasta
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) =>
                  setFechaHasta(
                    e.target.value
                  )
                }
              />
            </label>
          </div>
        )}
      </div>

      {comprasPosteriores.length > 0 && (
        <section className="card" style={{marginBottom:18,borderColor:'#e8c8d8'}}>
          <h2 style={{fontSize:18,marginBottom:8}}>📅 Comprar más cerca del día de uso</h2>
          <p style={{fontSize:13,marginBottom:12}}>
            Estos frescos no se incluyen en la compra de hoy porque podrían estropearse antes de cocinarlos.
            Vuelven automáticamente a la lista cuando se acerca su fecha de compra.
          </p>
          <div style={{display:'grid',gap:8}}>
            {comprasPosteriores.map(item=><div key={item.clave} style={{padding:'10px 12px',borderRadius:12,background:'#fff9fc',border:'1px solid #eddbe7'}}>
              <strong>{item.nombre}</strong>
              <div style={{fontSize:13}}>🛍️ Comprar a partir del <strong>{item.comprarDesde}</strong> · Para cocinar el {item.fechasUso.join(', ')}</div>
              {item.cantidad !== null && item.unidad && <div style={{fontSize:12}}>Cantidad orientativa: {item.cantidad} {item.unidad}</div>}
            </div>)}
          </div>
          <p style={{fontSize:12,marginTop:10}}>La conservación usada es orientativa para productos frescos refrigerados. Comprueba siempre la caducidad real del envase y las condiciones de almacenamiento; congelar cambia la planificación.</p>
        </section>
      )}
      {comprasPosteriores.some(item=>ingredientes.some(actual=>actual.clave===item.clave)) && (
        <p className="card" role="status" style={{marginBottom:16}}>
          💡 Algunos alimentos aparecen tanto en la compra actual como en la posterior: se necesitan en días separados y conviene comprarlos en dos tandas.
        </p>
      )}

      {!modoSupermercado && (
        <FormularioCompraManual
          onAgregar={
            agregarItemCompraManual
          }
        />
      )}

      {paraComprar.length > 0 && <details className="card" style={{marginBottom:18}}>
        <summary style={{cursor:'pointer',fontWeight:800}}>📅 ¿Para qué día necesito cada producto?</summary>
        <div style={{display:'grid',gap:10,marginTop:12}}>
          {paraComprar.filter(item=>!item.clave.startsWith('manual-')).map(item=><div key={item.clave} style={{borderBottom:'1px solid var(--borde)',paddingBottom:8}}>
            <strong>{item.nombre}</strong>{item.cantidadFaltante!==null && item.unidad ? ` · comprar ${item.cantidadFaltante} ${item.unidad}` : ''}
            <div style={{fontSize:13,color:'var(--txt2)'}}>{(usosPorIngrediente.get(item.clave)??[]).map(u=>`${u.fecha} (${u.receta})`).join(' · ') || 'Sin fecha identificada'}</div>
          </div>)}
        </div>
        <p style={{fontSize:12,marginTop:10}}>Las fechas indican cuándo se usa el ingrediente; la cantidad a comprar es el total pendiente del rango seleccionado.</p>
      </details>}
      <ResumenCompra
        total={
          paraComprar.length +
          yaDisponibles.length
        }
        paraComprar={
          paraComprar.length
        }
        yaDisponibles={
          yaDisponibles.length
        }
        manuales={
          compraManual.length
        }
        comprados={
          checksCompra.length
        }
        onFinalizarCompra={
          confirmarCompra
        }
      />

      {modoSupermercado && (
        <div
          className="card"
          style={{
            marginBottom: 18,
            background: '#fffaf8',
            borderColor: '#f5dde8',
          }}
        >
          <p
            style={{
              color: '#8f7080',
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            🛍️ Modo supermercado:
            lista compacta por secciones, cantidades visibles y checks rápidos.
          </p>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setModoSupermercado(
                false
              )
            }
          >
            ✍️ Añadir compra manual
          </button>
        </div>
      )}

      {compradosOcultos > 0 &&
        !mostrarComprados && (
          <div
            className="card"
            style={{
              marginBottom: 18,
              background: '#f7fff8',
              borderColor: '#cfead2',
              color: '#407040',
              fontWeight: 800,
              display: 'flex',
              justifyContent:
                'space-between',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span>
              ✅ {compradosOcultos}{' '}
              comprado
              {compradosOcultos === 1
                ? ''
                : 's'}{' '}
              oculto
              {compradosOcultos === 1
                ? ''
                : 's'}
            </span>

            <button
              type="button"
              className="btn-secundario"
              onClick={() =>
                setMostrarComprados(
                  true
                )
              }
            >
              👁️ Ver
            </button>
          </div>
        )}

      {totalCompra === 0 &&
        yaDisponibles.length === 0 && (
          <div className="card">
            <p
              style={{
                color: '#9e7d90',
              }}
            >
              {comprasPosteriores.length ? '✅ No hay compras necesarias hoy. Los frescos para próximos días están programados arriba.' : 'Aún no hay ingredientes pendientes en este rango ni extras manuales 💕'}
            </p>
          </div>
        )}

      {totalCompra === 0 &&
        paraComprar.length > 0 &&
        compradosOcultos > 0 &&
        !mostrarComprados && (
          <div className="card">
            <p
              style={{
                color: '#9e7d90',
                fontWeight: 800,
              }}
            >
              Todo lo pendiente está comprado y oculto ✅💕
            </p>
          </div>
        )}

      {(totalCompra > 0 ||
        yaDisponibles.length > 0) && (
        <>
          {modoSupermercado ? (
            <ModoSupermercado
              grupos={
                agrupadosComprar
              }
              comprados={
                checksCompra
              }
              compraManual={
                compraManual
              }
              onToggleComprado={
                toggleCheckCompra
              }
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 22,
              }}
            >
              <section>
                <h2
                  style={{
                    marginBottom: 14,
                    color: '#c45b86',
                  }}
                >
                  🛒 Necesitas comprar
                </h2>

                <GrupoCompra
                  titulo="comprar"
                  grupos={
                    agrupadosComprar
                  }
                  modo="comprar"
                  inventario={
                    inventario
                  }
                  comprados={
                    checksCompra
                  }
                  compraManual={
                    compraManual
                  }
                  onToggleComprado={
                    toggleCheckCompra
                  }
                  onEliminarManual={
                    eliminarItemCompraManual
                  }
                />
              </section>

              <section>
                <h2
                  style={{
                    marginBottom: 14,
                    color: '#8f7080',
                  }}
                >
                  📦 Ya tienes en inventario
                </h2>

                <GrupoCompra
                  titulo="disponible"
                  grupos={
                    agrupadosDisponibles
                  }
                  modo="disponible"
                  inventario={
                    inventario
                  }
                  comprados={
                    checksCompra
                  }
                  compraManual={
                    compraManual
                  }
                  onToggleComprado={
                    toggleCheckCompra
                  }
                  onEliminarManual={
                    eliminarItemCompraManual
                  }
                />
              </section>
            </div>
          )}
        </>
      )}
    </div>
  )
}