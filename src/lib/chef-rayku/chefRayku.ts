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
    mensaje.includes('quota') ||
    mensaje.includes('rate') ||
    mensaje.includes('limit') ||
    mensaje.includes('network') ||
    mensaje.includes('failed to fetch')
  )
}

async function consultarGemini(
  prompt: string
) {
  const resultado =
    await geminiModel.generateContent(
      prompt
    )

  const texto =
    resultado.response.text()

  return limpiarRespuestaJson(
    texto
  )
}

export async function consultarChefRayku(
  tipo: TipoConsultaChefRayku,
  datos: DatosContextoRayku
) {
  const contexto =
    crearContextoRayku(datos)

  const contextoTexto =
    contextoRaykuATexto(
      contexto
    )

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
      'Gemini no disponible, probando OpenRouter...',
      errorGemini
    )

    if (
      !esErrorRecuperable(
        errorGemini
      )
    ) {
      throw errorGemini
    }

    try {
      const respuestaOpenRouter =
        await consultarOpenRouter(
          prompt
        )

      return limpiarRespuestaJson(
        respuestaOpenRouter
      )
    } catch (errorOpenRouter) {
      console.warn(
        'OpenRouter no disponible, probando Ollama...',
        errorOpenRouter
      )

      if (
        !esErrorRecuperable(
          errorOpenRouter
        )
      ) {
        throw errorOpenRouter
      }

      const respuestaOllama =
        await consultarOllama(
          prompt
        )

      return limpiarRespuestaJson(
        respuestaOllama
      )
    }
  }
}