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
  const usos = new Map<string, number>()
  const ultimaFecha = new Map<string, string>()
  for (const item of planning) {
    for (const id of item.recetaIds?.length ? item.recetaIds : item.recetaId ? [item.recetaId] : []) {
      usos.set(id, (usos.get(id) ?? 0) + 1)
      if ((ultimaFecha.get(id) ?? '') < item.fecha) ultimaFecha.set(id, item.fecha)
    }
  }
  for (const fecha of fechas) {
    for (const tipoComida of ['comida', 'cena'] as const) {
      if (planning.some(p => p.fecha === fecha && p.tipoComida === tipoComida)) continue
      const compatibles = elegibles.filter(r => recetaCompatible(r, tipoComida))
      const puntuacion = (r: Receta) => {
        const favoritos = preferencias.ingredientesFavoritos.filter(Boolean)
        const favorito = favoritos.some(f => [r.nombre, ...r.ingredientes].some(i => normalizarIngrediente(i).includes(normalizarIngrediente(f))))
        const repetidaHoy = ultimaFecha.get(r.id) === fecha
        return (usos.get(r.id) ?? 0) * 100 + (repetidaHoy ? 1000 : 0) -
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
      ultimaFecha.set(elegida.id, fecha)
    }
  }
  return { propuestas, sinCubrir }
}
