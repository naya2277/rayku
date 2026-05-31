import {
  geminiModel,
} from '../../services/ia/gemini'

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

  const resultado =
    await geminiModel.generateContent(
      prompt
    )

  return resultado.response.text()
}