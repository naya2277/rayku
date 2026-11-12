/**
 * Operaciones de borrado atómicas. Mantienen los registros no seleccionados
 * y protegen las comidas ya cocinadas y su historial.
 */
export function quitarDiasNoCocinados<T extends { fecha: string; cocinado?: boolean }>(
  planning: T[], fechas: string[],
): T[] {
  const seleccion = new Set(fechas.filter(fecha => /^\d{4}-\d{2}-\d{2}$/.test(fecha)))
  if (seleccion.size === 0) return planning
  return planning.filter(item => !seleccion.has(item.fecha) || item.cocinado === true)
}

export function quitarRegistrosPorId<T extends { id: string }>(
  registros: T[], ids: string[],
): T[] {
  const seleccion = new Set(ids.filter(Boolean))
  if (seleccion.size === 0) return registros
  return registros.filter(item => !seleccion.has(item.id))
}
