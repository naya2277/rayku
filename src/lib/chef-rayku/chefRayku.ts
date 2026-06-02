import {
  geminiModel,
} from '../../services/ia/gemini'

import {
  consultarOpenRouter,
} from '../../services/ia/openrouter'

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

function mensajeError(
  error: unknown
) {
  return error instanceof Error
    ? error.message
    : String(error)
}

function esErrorRecuperable(
  error: unknown
) {
  const mensaje =
    mensajeError(error)
      .toLowerCase()

  return (
    mensaje.includes('429') ||
    mensaje.includes('503') ||
    mensaje.includes('service unavailable') ||
    mensaje.includes('high demand') ||
    mensaje.includes('try again later') ||
    mensaje.includes('quota') ||
    mensaje.includes('rate') ||
    mensaje.includes('limit') ||
    mensaje.includes('network') ||
    mensaje.includes('failed to fetch')
  )
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
  if (tipo === 'ideas_recetas') {
    return contextoInspiracionLibre(
      contexto
    )
  }

  return contextoRaykuATexto(
    contexto
  )
}

async function consultarGemini(
  prompt: string
) {
  const resultado =
    await geminiModel.generateContent(
      prompt
    )

  return limpiarRespuestaJson(
    resultado.response.text()
  )
}

async function consultarOpenRouterLimpio(
  prompt: string
) {
  const respuesta =
    await consultarOpenRouter(
      prompt
    )

  return limpiarRespuestaJson(
    respuesta
  )
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
    )

  const prompt =
    crearPromptChefRayku(
      tipo,
      contextoTexto
    )

  try {
    return await consultarOpenRouterLimpio(
      prompt
    )
  } catch (errorOpenRouter) {
    console.warn(
      'OpenRouter no disponible, probando Gemini...',
      errorOpenRouter
    )

    if (
      !esErrorRecuperable(
        errorOpenRouter
      )
    ) {
      throw errorOpenRouter
    }

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

      throw errorGemini
    }
  }
}