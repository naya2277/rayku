import {
  geminiModel,
} from '../../services/ia/gemini'

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

function esErrorCuotaGemini(
  error: unknown
) {
  const mensaje =
    error instanceof Error
      ? error.message
      : String(error)

  return (
    mensaje.includes('429') ||
    mensaje
      .toLowerCase()
      .includes('quota')
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
  } catch (error) {
    console.warn(
      'Gemini no disponible, probando Ollama...',
      error
    )

    if (!esErrorCuotaGemini(error)) {
      throw error
    }

    const respuestaOllama =
      await consultarOllama(prompt)

    return limpiarRespuestaJson(
      respuestaOllama
    )
  }
}