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
    mensajeError(error).toLowerCase()

  return (
    mensaje.includes('429') ||
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
      return limpiarRespuestaJson(
        await consultarOpenRouter(
          prompt
        )
      )
    } catch (errorOpenRouter) {
      console.warn(
        'OpenRouter no disponible.',
        errorOpenRouter
      )

      if (
        puedeUsarOllamaLocal()
      ) {
        console.warn(
          'Probando Ollama local...'
        )

        return limpiarRespuestaJson(
          await consultarOllama(
            prompt
          )
        )
      }

      throw errorOpenRouter
    }
  }
}