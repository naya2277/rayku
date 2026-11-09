import type { ItemPlanning, Receta, PreferenciasAlimentarias, TipoComida } from '../store/types'

type Hueco = { fecha: string; tipoComida: TipoComida; recetaId: string; recetaNombre: string }
type Resultado = { propuestas: Hueco[]; sinCubrir: string[] }

const normalizar = (texto: string) => texto.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

// Deterministic suggestions: same recipes and dates produce the same weekly menu.
// Existing meals are never replaced by the generator.
export function generarMenuSemanal(
  fechas: string[],
  recetas: Receta[],
  planning: ItemPlanning[],
  preferencias: PreferenciasAlimentarias,
): Resultado {
  const prohibidos = preferencias.ingredientesProhibidos.map(normalizar).filter(Boolean)
  const favoritos = preferencias.ingredientesFavoritos.map(normalizar).filter(Boolean)
  const elegibles = recetas.filter(r => r.nombre.trim() && !prohibidos.some(p =>
    [...r.ingredientes, ...r.ingredientesBase, r.nombre].some(ingrediente => normalizar(ingrediente).includes(p))
  ))
  const propuestas: Hueco[] = []
  const sinCubrir: string[] = []
  const usos = new Map<string, number>()
  for (const item of planning) {
    for (const id of item.recetaIds?.length ? item.recetaIds : item.recetaId ? [item.recetaId] : []) {
      usos.set(id, (usos.get(id) ?? 0) + 1)
    }
  }
  for (const fecha of fechas) {
    for (const tipoComida of ['comida', 'cena'] as const) {
      if (planning.some(p => p.fecha === fecha && p.tipoComida === tipoComida)) continue
      const compatibles = elegibles.filter(r =>
        r.tiposComida.length === 0 || r.tiposComida.some(t => {
          const v = normalizar(t)
          return v === tipoComida || v === (tipoComida === 'comida' ? 'almuerzo' : 'cenas') || v === 'ambos'
        })
      )
      const puntuacion = (r: Receta) =>
        (usos.get(r.id) ?? 0) * 100 +
        (r.ingredientes.some(i => favoritos.some(f => normalizar(i).includes(f))) ? -8 : 0) +
        (r.favorita ? -4 : 0) +
        (tipoComida === 'cena' && r.tiempo > 45 ? 2 : 0)
      const elegida = [...compatibles].sort((a,b) => puntuacion(a) - puntuacion(b) || a.nombre.localeCompare(b.nombre, 'es'))[0]
      if (!elegida) {
        sinCubrir.push(`${fecha} · ${tipoComida}`)
        continue
      }
      propuestas.push({ fecha, tipoComida, recetaId: elegida.id, recetaNombre: elegida.nombre })
      usos.set(elegida.id, (usos.get(elegida.id) ?? 0) + 1)
    }
  }
  return { propuestas, sinCubrir }
}
