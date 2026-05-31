import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey =
  import.meta.env
    .VITE_GEMINI_API_KEY

if (!apiKey) {
  throw new Error(
    'VITE_GEMINI_API_KEY no configurada'
  )
}

const genAI =
  new GoogleGenerativeAI(
    apiKey
  )

export const geminiModel =
  genAI.getGenerativeModel({
    model:
      'gemini-2.5-flash',
  })

export async function probarGemini() {
  const resultado =
    await geminiModel.generateContent(
      'Responde únicamente con: Rayku conectado 💕'
    )

  return resultado.response.text()
}