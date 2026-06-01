import {
  generarId,
} from './utils'

import type {
  Receta,
  ItemInventario,
  ItemPlanning,
  ItemCompraManual,
  RegistroCocinado,
  PreferenciasAlimentarias,
} from './types'

import {
  normalizarCantidadUnidad,
} from '../lib/cantidadesIngredientes'

function limpiarListaTexto(
  lista: any
) {
  if (!Array.isArray(lista)) {
    return []
  }

  return lista
    .map((item) =>
      String(item).trim()
    )
    .filter(Boolean)
}

export const normalizarReceta = (
  r: any
): Receta => ({
  id: r.id ?? generarId(),
  nombre: r.nombre ?? '',
  imagen: r.imagen ?? '',
  favorita: r.favorita ?? false,
  ingredientes: Array.isArray(r.ingredientes)
    ? r.ingredientes
    : [],
  pasos: r.pasos ?? '',
  tiposComida: Array.isArray(r.tiposComida)
    ? r.tiposComida
    : [],
  ingredientesBase: Array.isArray(r.ingredientesBase)
    ? r.ingredientesBase
    : [],
  dietas: Array.isArray(r.dietas)
    ? r.dietas
    : [],
  caracteristicas: Array.isArray(r.caracteristicas)
    ? r.caracteristicas
    : [],
  tiempo: Number(r.tiempo) || 0,
  raciones: Number(r.raciones) || 1,
  dificultad: r.dificultad ?? 'Fácil',
  requiereDescongelar:
    r.requiereDescongelar ?? false,
  valoracion: Number(r.valoracion) || 0,
  nota: r.nota ?? '',
})

export const normalizarInventario = (
  item: any
): ItemInventario => {
  const cantidadOriginal =
    Number(item.cantidad) || 0

  const unidadOriginal =
    item.unidad ?? 'g'

  const normalizado =
    normalizarCantidadUnidad(
      cantidadOriginal,
      unidadOriginal
    )

  return {
    id: item.id ?? generarId(),
    nombre: item.nombre ?? '',
    cantidad:
      normalizado.cantidad,
    unidad:
      normalizado.unidad,
    categoria:
      item.categoria ?? 'otros',
    ubicacion:
      item.ubicacion ??
      'despensa',
    fechaCaducidad:
      item.fechaCaducidad ??
      null,
    fechaDescongelar:
      item.fechaDescongelar ??
      null,
    necesitaDescongelar:
      item.necesitaDescongelar ??
      false,
    avisarStockBajo:
      item.avisarStockBajo ??
      false,
  }
}

export const normalizarCompraManual = (
  item: any
): ItemCompraManual => ({
  id: item.id ?? generarId(),
  nombre: item.nombre ?? '',
  cantidad:
    item.cantidad === null ||
    item.cantidad === undefined ||
    item.cantidad === ''
      ? null
      : String(item.cantidad),
})

function normalizarRecetaIdsPlanning(
  item: any
) {
  if (Array.isArray(item.recetaIds)) {
    return item.recetaIds.filter(
      Boolean
    )
  }

  if (item.recetaId) {
    return [item.recetaId]
  }

  return []
}

export const normalizarPlanning = (
  item: any
): ItemPlanning => {
  const recetaIds =
    normalizarRecetaIdsPlanning(
      item
    )

  return {
    id: item.id ?? generarId(),
    fecha: item.fecha ?? '',
    tipoComida:
      item.tipoComida ??
      'comida',
    recetaId:
      item.recetaId ??
      recetaIds[0] ??
      null,
    recetaIds,
    comidaLibre:
      item.comidaLibre ?? '',
    nota: item.nota ?? '',
    racionesOverride:
      item.racionesOverride ??
      null,
    cocinado:
      item.cocinado ?? false,
  }
}

export const normalizarRegistroCocinado = (
  item: any
): RegistroCocinado => {
  const recetaIds =
    Array.isArray(item.recetaIds)
      ? item.recetaIds.filter(
          Boolean
        )
      : item.recetaId
        ? [item.recetaId]
        : []

  return {
    id: item.id ?? generarId(),
    planningId:
      item.planningId ?? '',
    fecha: item.fecha ?? '',
    tipoComida:
      item.tipoComida ??
      'comida',
    origen:
      item.origen ??
      'comida_libre',
    recetaId:
      item.recetaId ??
      recetaIds[0] ??
      null,
    recetaIds,
    recetaNombre:
      item.recetaNombre ??
      null,
    recetaNombres:
      Array.isArray(
        item.recetaNombres
      )
        ? item.recetaNombres
        : item.recetaNombre
          ? [item.recetaNombre]
          : [],
    comidaLibre:
      item.comidaLibre ?? '',
    raciones:
      item.raciones === null ||
      item.raciones ===
        undefined
        ? null
        : Number(
            item.raciones
          ),
    ingredientesOriginales:
      Array.isArray(
        item.ingredientesOriginales
      )
        ? item.ingredientesOriginales
        : [],
    cambiosInventario:
      Array.isArray(
        item.cambiosInventario
      )
        ? item.cambiosInventario.map(
            (c: any) => ({
              itemId:
                c.itemId ?? '',
              nombre:
                c.nombre ?? '',
              unidad:
                c.unidad ?? '',
              cantidadAnterior:
                Number(
                  c.cantidadAnterior
                ) || 0,
              cantidadNueva:
                Number(
                  c.cantidadNueva
                ) || 0,
            })
          )
        : [],
    creadoEn:
      item.creadoEn ??
      new Date().toISOString(),
  }
}

export const normalizarPreferenciasAlimentarias = (
  item: any
): PreferenciasAlimentarias => ({
  ingredientesProhibidos:
    limpiarListaTexto(
      item?.ingredientesProhibidos
    ),
  ingredientesFavoritos:
    limpiarListaTexto(
      item?.ingredientesFavoritos
    ),
})