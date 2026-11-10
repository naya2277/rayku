import type { ItemPlanning, Receta, PreferenciasAlimentarias, TipoComida, ItemInventario } from '../store/types'
import type { PerfilHogar } from './perfilHogar'
import { calcularIngredientesEscalados } from './recetas/calcularIngredientesEscalados'
import { obtenerClaveIngredienteCompra } from './compra/normalizacionCompra'

type Hueco = { fecha: string; tipoComida: TipoComida; recetaId: string; recetaNombre: string }
type Resultado = { propuestas: Hueco[]; sinCubrir: string[] }

export const normalizarIngrediente = (texto: string) =>
  texto.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

export function recetaPermitida(receta: Receta, preferencias: PreferenciasAlimentarias) {
  const textos = [receta.nombre, ...receta.ingredientes, ...receta.ingredientesBase].map(normalizarIngrediente)
  return !preferencias.ingredientesProhibidos.some(ingrediente => {
    const prohibido = normalizarIngrediente(ingrediente)
    return prohibido !== '' && textos.some(texto => texto.includes(prohibido))
  })
}

export function recetaCompatible(receta: Receta, tipo: TipoComida) {
  if (!receta.tiposComida.length) return true
  return receta.tiposComida.some(valor => {
    const v = normalizarIngrediente(valor)
    return v === tipo || v === 'ambos' || v === 'comida y cena' ||
      (tipo === 'comida' && (v === 'almuerzo' || v === 'comidas')) ||
      (tipo === 'cena' && v === 'cenas')
  })
}

export function recetaCompatibleHogar(receta: Receta, hogar?: PerfilHogar) {
  if (!hogar) return true
  const prohibidos = hogar.personas.flatMap(p => p.prohibidos)
  if (!recetaPermitida(receta, {ingredientesProhibidos: prohibidos, ingredientesFavoritos: []})) return false
  const aparatos = hogar.aparatos
  const pasos = normalizarIngrediente(receta.pasos)
  if (aparatos.length && /\bhorno\b/.test(pasos) && !aparatos.includes('Horno') && !/freidora de aire|air ?fryer/.test(pasos)) return false
  if (aparatos.length && /freidora de aire|air ?fryer/.test(pasos) && !aparatos.includes('Freidora de aire') && !/\bhorno\b/.test(pasos)) return false
  return true
}

export function generarMenuSemanal(
  fechas: string[],
  recetas: Receta[],
  planning: ItemPlanning[],
  preferencias: PreferenciasAlimentarias,
  inventario: ItemInventario[] = [],
  hogar?: PerfilHogar,
  priorizarInventario = false,
): Resultado {
  const prohibidosHogar = hogar?.personas.flatMap(p => p.prohibidos) ?? []
  const preferenciasCombinadas = { ...preferencias, ingredientesProhibidos: [...preferencias.ingredientesProhibidos, ...prohibidosHogar], ingredientesFavoritos: [...preferencias.ingredientesFavoritos, ...(hogar?.personas.flatMap(p=>p.favoritos) ?? [])] }
  const elegibles = recetas.filter(r => r.nombre.trim() && recetaPermitida(r, preferenciasCombinadas) && recetaCompatibleHogar(r, hogar))
  const disponibles = new Map<string, number>()
  const caducidades = new Map<string, string[]>()
  for (const item of inventario) {
    if (item.ubicacion === 'pendiente' || item.cantidad <= 0) continue
    const clave = obtenerClaveIngredienteCompra(item.nombre) + '|' + item.unidad
    disponibles.set(clave, (disponibles.get(clave) ?? 0) + item.cantidad)
    if (item.fechaCaducidad) caducidades.set(clave, [...(caducidades.get(clave) ?? []), item.fechaCaducidad])
  }
  const reservas = new Map<string, number>()
  const reservar = (r: Receta, raciones = r.raciones) => {
    for (const ingrediente of calcularIngredientesEscalados(r, raciones)) {
      if (ingrediente.cantidad === null || !ingrediente.unidad) continue
      const clave = obtenerClaveIngredienteCompra(ingrediente.nombre) + '|' + ingrediente.unidad
      reservas.set(clave, (reservas.get(clave) ?? 0) + ingrediente.cantidad)
    }
  }
  // Lo ya planificado también consume parte del stock disponible.
  for (const item of planning) {
    if (item.cocinado || item.fecha < (fechas[0] ?? '') || item.fecha > (fechas.at(-1) ?? '')) continue
    for (const id of item.recetaIds?.length ? item.recetaIds : item.recetaId ? [item.recetaId] : []) {
      const r = recetas.find(x=>x.id===id)
      if (r) reservar(r, item.racionesOverride || r.raciones)
    }
  }
  const propuestas: Hueco[] = []
  const sinCubrir: string[] = []
  // Solo las comidas próximas a la semana influyen en la variedad.
  // El historial remoto y las comidas futuras no deben penalizar recetas indefinidamente.
  const primeraFecha = [...fechas].sort()[0]
  const ultimaFechaSemana = [...fechas].sort().at(-1)
  const desde = primeraFecha ? new Date(primeraFecha + 'T12:00:00') : null
  desde?.setDate(desde.getDate() - 7)
  const limiteInferior = desde ? [desde.getFullYear(), String(desde.getMonth() + 1).padStart(2, '0'), String(desde.getDate()).padStart(2, '0')].join('-') : ''
  const usos = new Map<string, number>()
  const fechasPorReceta = new Map<string, string[]>()
  for (const item of planning) {
    if (item.fecha < limiteInferior || item.fecha > (ultimaFechaSemana ?? '')) continue
    for (const id of item.recetaIds?.length ? item.recetaIds : item.recetaId ? [item.recetaId] : []) {
      usos.set(id, (usos.get(id) ?? 0) + 1)
      fechasPorReceta.set(id, [...(fechasPorReceta.get(id) ?? []), item.fecha])
    }
  }
  for (const fecha of fechas) {
    for (const tipoComida of ['comida', 'cena'] as const) {
      if (planning.some(p => p.fecha === fecha && p.tipoComida === tipoComida)) continue
      const compatibles = elegibles.filter(r => recetaCompatible(r, tipoComida))
      const puntuacion = (r: Receta) => {
        const favoritos = preferenciasCombinadas.ingredientesFavoritos.filter(Boolean)
        const favorito = favoritos.some(f => [r.nombre, ...r.ingredientes].some(i => normalizarIngrediente(i).includes(normalizarIngrediente(f))))
        const fechasUsadas = fechasPorReceta.get(r.id) ?? []
        const repetidaHoy = fechasUsadas.includes(fecha)
        const fechaActual = new Date(fecha + 'T12:00:00').getTime()
        const repetidaCerca = fechasUsadas.some(f => Math.abs(new Date(f + 'T12:00:00').getTime() - fechaActual) <= 2 * 86400000)
        const ingredientes = calcularIngredientesEscalados(r)
        const conocidos = ingredientes.filter(i => i.cantidad !== null && i.unidad)
        const cubiertos = conocidos.filter(i => {
          const clave = obtenerClaveIngredienteCompra(i.nombre) + '|' + i.unidad
          return (disponibles.get(clave) ?? 0) - (reservas.get(clave) ?? 0) >= (i.cantidad ?? 0)
        }).length
        const rechazadas = hogar?.personas.flatMap(p=>p.rechazadas) ?? []
        const penalizacionRechazo = rechazadas.includes(r.id) ? 400 : 0
        const ventajaInventario = priorizarInventario && conocidos.length ? 80 * cubiertos / conocidos.length : 0
        const ventajaCaducidad = priorizarInventario ? conocidos.reduce((total,i)=>{
          const clave = obtenerClaveIngredienteCompra(i.nombre) + '|' + i.unidad
          const caducaPronto = (caducidades.get(clave) ?? []).some(c => c >= fecha && c <= fechas.at(-1)!)
          return total + (caducaPronto ? 30 : 0)
        },0) : 0
        return penalizacionRechazo + (usos.get(r.id) ?? 0) * 100 + (repetidaHoy ? 1000 : repetidaCerca ? 250 : 0) - ventajaInventario - ventajaCaducidad -
          (favorito ? 8 : 0) - (r.favorita ? 4 : 0) +
          (tipoComida === 'cena' && r.tiempo > 45 ? 2 : 0)
      }
      const elegida = [...compatibles].sort((a, b) =>
        puntuacion(a) - puntuacion(b) || a.nombre.localeCompare(b.nombre, 'es'))[0]
      if (!elegida) {
        sinCubrir.push(`${fecha} · ${tipoComida}`)
        continue
      }
      propuestas.push({ fecha, tipoComida, recetaId: elegida.id, recetaNombre: elegida.nombre })
      reservar(elegida)
      usos.set(elegida.id, (usos.get(elegida.id) ?? 0) + 1)
      fechasPorReceta.set(elegida.id, [...(fechasPorReceta.get(elegida.id) ?? []), fecha])
    }
  }
  return { propuestas, sinCubrir }
}
