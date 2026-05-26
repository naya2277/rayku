import { supabase } from './supabase'
import type {
  Receta,
  ItemInventario,
  ItemPlanning,
} from '../store'

async function guardarDato(
  tipo: string,
  data: unknown,
  userId: string
) {
  const { data: existente, error: errorSelect } =
    await supabase
      .from('rayku_data')
      .select('id')
      .eq('user_id', userId)
      .eq('tipo', tipo)
      .limit(1)

  if (errorSelect) {
    console.error(`Error buscando ${tipo}:`, errorSelect)
    throw errorSelect
  }

  const idExistente = existente?.[0]?.id

  if (idExistente) {
    const { error } = await supabase
      .from('rayku_data')
      .update({
        data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', idExistente)

    if (error) {
      console.error(`Error actualizando ${tipo}:`, error)
      throw error
    }

    return
  }

  const { error } = await supabase
    .from('rayku_data')
    .insert({
      user_id: userId,
      tipo,
      data,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error(`Error insertando ${tipo}:`, error)
    throw error
  }
}

async function descargarDato(
  tipo: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('rayku_data')
    .select('data')
    .eq('user_id', userId)
    .eq('tipo', tipo)
    .limit(1)

  if (error) {
    console.error(`Error descargando ${tipo}:`, error)
    throw error
  }

  return data?.[0]?.data ?? null
}

export async function subirRecetas(
  recetas: Receta[],
  userId: string
) {
  await guardarDato('recetas', recetas, userId)
}

export async function descargarRecetas(
  userId: string
) {
  return await descargarDato('recetas', userId)
}

export async function subirInventario(
  inventario: ItemInventario[],
  userId: string
) {
  await guardarDato('inventario', inventario, userId)
}

export async function descargarInventario(
  userId: string
) {
  return await descargarDato('inventario', userId)
}

export async function subirPlanning(
  planning: ItemPlanning[],
  userId: string
) {
  await guardarDato('planning', planning, userId)
}

export async function descargarPlanning(
  userId: string
) {
  return await descargarDato('planning', userId)
}