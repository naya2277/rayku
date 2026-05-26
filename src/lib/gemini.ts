import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
})

export async function generarSugerenciaReceta(
  contexto: string
) {
  const result = await model.generateContent(contexto)
  return result.response.text()
}