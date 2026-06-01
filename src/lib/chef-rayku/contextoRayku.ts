import {
  calcularDiasCaducidad,
} from '../inventario'

import type {
  ContextoRayku,
  DatosContextoRayku,
} from './tipos'

function formatearInventario(
  nombre: string,
  cantidad: number,
  unidad: string,
  extra?: string
) {
  return [
    `${nombre}: ${cantidad}${unidad}`,
    extra,
  ]
    .filter(Boolean)
    .join(' · ')
}

function crearLineaReceta(
  receta: {
    nombre: string
    ingredientes: string[]
    raciones: number
    tiempo: number
    dificultad: string
    favorita: boolean
    dietas: string[]
    caracteristicas: string[]
  }
) {
  const etiquetas = [
    receta.favorita ? 'favorita' : null,
    ...receta.dietas,
    ...receta.caracteristicas,
  ].filter(Boolean)

  return [
    receta.nombre,
    `${receta.raciones} raciones`,
    receta.tiempo
      ? `${receta.tiempo} min`
      : null,
    receta.dificultad,
    etiquetas.length > 0
      ? `Etiquetas: ${etiquetas.join(', ')}`
      : null,
    `Ingredientes: ${receta.ingredientes.join(', ')}`,
  ]
    .filter(Boolean)
    .join(' | ')
}

export function crearContextoRayku({
  recetas,
  inventario,
  planning,
  historialCocinado,
  preferenciasAlimentarias,
}: DatosContextoRayku): ContextoRayku {
  const inventarioDisponible =
    inventario
      .filter(
        (item) =>
          item.ubicacion !== 'pendiente' &&
          item.cantidad > 0
      )
      .slice(0, 80)
      .map((item) =>
        formatearInventario(
          item.nombre,
          item.cantidad,
          item.unidad,
          item.ubicacion
        )
      )

  const productosPendientes =
    inventario
      .filter(
        (item) =>
          item.ubicacion === 'pendiente' &&
          item.cantidad > 0
      )
      .slice(0, 40)
      .map((item) =>
        formatearInventario(
          item.nombre,
          item.cantidad,
          item.unidad,
          'pendiente de guardar'
        )
      )

  const productosCaducanPronto =
    inventario
      .filter((item) => {
        if (
          item.ubicacion === 'pendiente' ||
          item.cantidad <= 0
        ) {
          return false
        }

        const dias =
          calcularDiasCaducidad(
            item.fechaCaducidad
          )

        return (
          dias !== null &&
          dias <= 4
        )
      })
      .sort((a, b) => {
        const diasA =
          calcularDiasCaducidad(
            a.fechaCaducidad
          ) ?? 999

        const diasB =
          calcularDiasCaducidad(
            b.fechaCaducidad
          ) ?? 999

        return diasA - diasB
      })
      .slice(0, 30)
      .map((item) => {
        const dias =
          calcularDiasCaducidad(
            item.fechaCaducidad
          )

        const estado =
          dias === null
            ? 'sin fecha'
            : dias < 0
              ? `caducado hace ${Math.abs(dias)} días`
              : dias === 0
                ? 'caduca hoy'
                : `caduca en ${dias} días`

        return formatearInventario(
          item.nombre,
          item.cantidad,
          item.unidad,
          estado
        )
      })

  const recetasDisponibles =
    recetas
      .slice(0, 60)
      .map(crearLineaReceta)

  const planningActual =
    planning
      .slice(-28)
      .map((item) => {
        const estado =
          item.cocinado
            ? 'cocinado'
            : 'pendiente'

        const recetasHueco =
          item.recetaIds.length > 0
            ? item.recetaIds.join(', ')
            : item.recetaId ?? 'sin receta'

        return [
          item.fecha,
          item.tipoComida,
          estado,
          `recetas: ${recetasHueco}`,
          item.comidaLibre
            ? `extra: ${item.comidaLibre}`
            : null,
          item.racionesOverride
            ? `raciones: ${item.racionesOverride}`
            : null,
        ]
          .filter(Boolean)
          .join(' | ')
      })

  const historialReciente =
    historialCocinado
      .slice(-15)
      .map((item) =>
        [
          item.fecha,
          item.tipoComida,
          item.recetaNombre ??
            item.recetaNombres?.join(', ') ??
            item.comidaLibre ??
            'comida sin nombre',
          `${item.cambiosInventario.length} cambios de inventario`,
        ].join(' | ')
      )

  const ingredientesProhibidos =
    preferenciasAlimentarias
      .ingredientesProhibidos

  const ingredientesFavoritos =
    preferenciasAlimentarias
      .ingredientesFavoritos

  const resumen = [
    `Recetas guardadas: ${recetas.length}`,
    `Productos en inventario: ${inventario.length}`,
    `Productos disponibles: ${inventarioDisponible.length}`,
    `Productos pendientes de guardar: ${productosPendientes.length}`,
    `Productos que caducan pronto: ${productosCaducanPronto.length}`,
    `Huecos de planning: ${planning.length}`,
    `Cocinados registrados: ${historialCocinado.length}`,
    `Ingredientes prohibidos: ${ingredientesProhibidos.length}`,
    `Ingredientes favoritos: ${ingredientesFavoritos.length}`,
  ].join('\n')

  return {
    resumen,
    inventarioDisponible,
    productosPendientes,
    productosCaducanPronto,
    recetasDisponibles,
    planningActual,
    historialReciente,
    ingredientesProhibidos,
    ingredientesFavoritos,
  }
}

export function contextoRaykuATexto(
  contexto: ContextoRayku
) {
  return [
    'RESUMEN',
    contexto.resumen,

    'INGREDIENTES PROHIBIDOS',
    contexto.ingredientesProhibidos.join('\n') ||
      'Sin ingredientes prohibidos.',

    'INGREDIENTES FAVORITOS',
    contexto.ingredientesFavoritos.join('\n') ||
      'Sin ingredientes favoritos.',

    'INVENTARIO DISPONIBLE',
    contexto.inventarioDisponible.join('\n') ||
      'Sin inventario disponible.',

    'PRODUCTOS PENDIENTES',
    contexto.productosPendientes.join('\n') ||
      'Sin productos pendientes.',

    'PRODUCTOS QUE CADUCAN PRONTO',
    contexto.productosCaducanPronto.join('\n') ||
      'Sin productos próximos a caducar.',

    'RECETAS GUARDADAS',
    contexto.recetasDisponibles.join('\n') ||
      'Sin recetas guardadas.',

    'PLANNING',
    contexto.planningActual.join('\n') ||
      'Sin planning.',

    'HISTORIAL RECIENTE',
    contexto.historialReciente.join('\n') ||
      'Sin historial reciente.',
  ].join('\n\n')
}