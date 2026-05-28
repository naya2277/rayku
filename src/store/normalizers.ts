import {
  generarId,
} from './utils'

import type {
  Receta,
  ItemInventario,
  ItemPlanning,
  ItemCompraManual,
} from './types'

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
  requiereDescongelar: r.requiereDescongelar ?? false,
  valoracion: Number(r.valoracion) || 0,
  nota: r.nota ?? '',
})

export const normalizarInventario = (
  item: any
): ItemInventario => ({
  id: item.id ?? generarId(),
  nombre: item.nombre ?? '',
  cantidad: Number(item.cantidad) || 0,
  unidad: item.unidad ?? 'g',
  categoria: item.categoria ?? 'otros',
  ubicacion: item.ubicacion ?? 'despensa',
  fechaCaducidad: item.fechaCaducidad ?? null,
  fechaDescongelar: item.fechaDescongelar ?? null,
  necesitaDescongelar: item.necesitaDescongelar ?? false,
})

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

export const normalizarPlanning = (
  item: any
): ItemPlanning => ({
  id: item.id ?? generarId(),
  fecha: item.fecha ?? '',
  tipoComida: item.tipoComida ?? 'comida',
  recetaId: item.recetaId ?? null,
  comidaLibre: item.comidaLibre ?? '',
  nota: item.nota ?? '',
  racionesOverride: item.racionesOverride ?? null,
  cocinado: item.cocinado ?? false,
})