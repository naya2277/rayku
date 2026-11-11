import { supabase } from '../supabase'
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
  if(import.meta.env.VITE_CHEF_RAYKU_PROXY === 'true') {
    const {data,error}=await supabase.functions.invoke('chef-rayku',{body:{prompt}})
    if(error) throw new Error('No se pudo consultar Chef Rayku: '+error.message)
    if(typeof data?.text!=='string') throw new Error('Respuesta vacía de Chef Rayku')
    return limpiarRespuestaJson(data.text)
  }
  if(!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('Gemini no está configurado todavía')
  const resultado =
    await geminiModel.generateContent(
      prompt
    )

  return limpiarRespuestaJson(
    resultado.response.text()
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

    throw new Error(
      'Chef Rayku está descansando un momento 💕 La IA está temporalmente saturada. Prueba de nuevo más tarde.'
    )
  }
}