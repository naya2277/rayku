import type { ItemPlanning, Receta, PreferenciasAlimentarias, TipoComida } from '../store/types'

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

export function generarMenuSemanal(
  fechas: string[],
  recetas: Receta[],
  planning: ItemPlanning[],
  preferencias: PreferenciasAlimentarias,
): Resultado {
  const elegibles = recetas.filter(r => r.nombre.trim() && recetaPermitida(r, preferencias))
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
        const favoritos = preferencias.ingredientesFavoritos.filter(Boolean)
        const favorito = favoritos.some(f => [r.nombre, ...r.ingredientes].some(i => normalizarIngrediente(i).includes(normalizarIngrediente(f))))
        const fechasUsadas = fechasPorReceta.get(r.id) ?? []
        const repetidaHoy = fechasUsadas.includes(fecha)
        const fechaActual = new Date(fecha + 'T12:00:00').getTime()
        const repetidaCerca = fechasUsadas.some(f => Math.abs(new Date(f + 'T12:00:00').getTime() - fechaActual) <= 2 * 86400000)
        return (usos.get(r.id) ?? 0) * 100 + (repetidaHoy ? 1000 : repetidaCerca ? 250 : 0) -
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
      usos.set(elegida.id, (usos.get(elegida.id) ?? 0) + 1)
      fechasPorReceta.set(elegida.id, [...(fechasPorReceta.get(elegida.id) ?? []), fecha])
    }
  }
  return { propuestas, sinCubrir }
}
