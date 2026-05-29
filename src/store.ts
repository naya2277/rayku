import { create } from 'zustand'

import {
  cargar,
} from './store/utils'

import {
  STORAGE_KEYS,
} from './store/storage'

import {
  normalizarReceta,
  normalizarInventario,
  normalizarPlanning,
  normalizarCompraManual,
  normalizarRegistroCocinado,
} from './store/normalizers'

import {
  crearRecetasSlice,
  type RecetasSlice,
} from './store/recetasSlice'

import {
  crearPlanningSlice,
  type PlanningSlice,
} from './store/planningSlice'

import {
  crearInventarioSlice,
  type InventarioSlice,
} from './store/inventarioSlice'

import {
  crearCompraSlice,
  type CompraSlice,
} from './store/compraSlice'

import {
  crearSyncSlice,
  type SyncSlice,
} from './store/syncSlice'

type Estado =
  RecetasSlice &
  PlanningSlice &
  InventarioSlice &
  CompraSlice &
  SyncSlice & {
    semanas: any[]
    listaCompra: any[]
    recordatorios: any[]
  }

export const useRaykuStore =
  create<Estado>(
    (set, get) => ({
      ...crearRecetasSlice(
        set,
        get
      ),

      ...crearPlanningSlice(
        set,
        get
      ),

      ...crearInventarioSlice(
        set,
        get
      ),

      ...crearCompraSlice(
        set,
        get
      ),

      ...crearSyncSlice(
        set,
        get
      ),

      recetas: cargar<any[]>(
        STORAGE_KEYS.recetas,
        []
      ).map(normalizarReceta),

      planning: cargar<any[]>(
        STORAGE_KEYS.planning,
        []
      ).map(normalizarPlanning),

      inventario: cargar<any[]>(
        STORAGE_KEYS.inventario,
        []
      ).map(normalizarInventario),

      compraManual: cargar<any[]>(
        STORAGE_KEYS.compraManual,
        []
      ).map(normalizarCompraManual),

      checksCompra: cargar<string[]>(
        STORAGE_KEYS.checksCompra,
        []
      ),

      historialCocinado: cargar<any[]>(
        STORAGE_KEYS.historialCocinado,
        []
      ).map(normalizarRegistroCocinado),

      semanas: [],

      listaCompra: [],

      recordatorios: [],
    })
  )

export type {
  Receta,
  ItemPlanning,
  ItemInventario,
  ItemCompraManual,
  TipoComida,
  Dificultad,
  RegistroCocinado,
  CambioInventarioCocinado,
} from './store/types'