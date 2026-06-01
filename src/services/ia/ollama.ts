const OLLAMA_URL =
  import.meta.env
    .VITE_OLLAMA_URL ||
  'http://localhost:11434'

const OLLAMA_MODEL =
  import.meta.env
    .VITE_OLLAMA_MODEL ||
  'gemma3:4b'

export async function consultarOllama(
  prompt: string
) {
  const respuesta =
    await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          format: 'json',
        }),
      }
    )

  if (!respuesta.ok) {
    throw new Error(
      `Error de Ollama: ${respuesta.status}`
    )
  }

  const data =
    await respuesta.json()

  return String(
    data.response || ''
  )
}