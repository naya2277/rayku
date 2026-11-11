import { supabase } from '../supabase'
import {
  consultarOllama,
} from '../../services/ia/ollama'

import {
  crearContextoRayku,
  contextoRaykuATexto,
} from './contextoRayku'

import {
  crearPromptChefRayku,
} from './prompts'

import type {
  ContextoRayku,
  DatosContextoRayku,
  TipoConsultaChefRayku,
} from './tipos'

function limpiarRespuestaJson(
  texto: string
) {
  return texto
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim()
}

function puedeUsarOllamaLocal() {
  return import.meta.env.DEV
}

function obtenerNombresRecetas(
  contexto: ContextoRayku
) {
  return contexto.recetasDisponibles
    .map((linea) =>
      linea.split('|')[0]?.trim()
    )
    .filter(Boolean)
}

function contextoInspiracionLibre(
  contexto: ContextoRayku
) {
  const nombresRecetas =
    obtenerNombresRecetas(
      contexto
    )

  return [
    'MODO INSPIRACIÓN LIBRE',
    'No uses inventario, caducidades, planning ni historial.',
    'La respuesta debe ser creativa y variada.',
    '',
    'INGREDIENTES PROHIBIDOS',
    contexto.ingredientesProhibidos.join('\n') ||
      'Sin ingredientes prohibidos.',
    '',
    'INGREDIENTES FAVORITOS',
    contexto.ingredientesFavoritos.join('\n') ||
      'Sin ingredientes favoritos.',
    '',
    'NOMBRES DE RECETAS YA EXISTENTES',
    nombresRecetas.join('\n') ||
      'Sin recetas guardadas.',
  ].join('\n')
}

function crearContextoTextoPorTipo(
  tipo: TipoConsultaChefRayku,
  contexto: ContextoRayku
) {
  if (tipo === 'ideas_recetas' || tipo === 'menu_dieta') {
    return contextoInspiracionLibre(
      contexto
    )
  }

  return contextoRaykuATexto(
    contexto
  )
}

async function consultarGemini(prompt: string) {
  const { data, error } = await supabase.functions.invoke('chef-rayku', { body: { prompt } })
  if (error) {
    const status = 'context' in error ? (error.context as Response | undefined)?.status : undefined
    throw new Error(status === 503
      ? 'Chef Rayku necesita que configures la clave privada de Gemini en Supabase.'
      : 'No se pudo consultar Gemini desde Supabase: ' + error.message)
  }
  if (typeof data?.text !== 'string' || !data.text.trim()) {
    throw new Error('Gemini devolvió una respuesta vacía.')
  }
  return limpiarRespuestaJson(data.text)
}

async function consultarOllamaLimpio(
  prompt: string
) {
  const respuesta =
    await consultarOllama(
      prompt
    )

  return limpiarRespuestaJson(
    respuesta
  )
}

export async function consultarChefRayku(
  tipo: TipoConsultaChefRayku,
  datos: DatosContextoRayku
) {
  const contexto =
    crearContextoRayku(datos)

  const contextoTexto =
    crearContextoTextoPorTipo(
      tipo,
      contexto
    ) + '\n\nDIETA DEL SOLICITANTE: ' + (datos.dietasSolicitante?.join(', ') || 'Sin dieta específica; no presupongas keto.')

  const prompt =
    crearPromptChefRayku(
      tipo,
      contextoTexto
    )

  try {
    return await consultarGemini(
      prompt
    )
  } catch (errorGemini) {
    console.warn(
      'Gemini no disponible.',
      errorGemini
    )

    if (
      puedeUsarOllamaLocal()
    ) {
      console.warn(
        'Probando Ollama local...'
      )

      return await consultarOllamaLimpio(
        prompt
      )
    }

    throw errorGemini instanceof Error ? errorGemini : new Error('Chef Rayku no está disponible ahora.')
  }
}