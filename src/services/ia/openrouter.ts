const OPENROUTER_API_KEY =
  import.meta.env
    .VITE_OPENROUTER_API_KEY

const OPENROUTER_URL =
  'https://openrouter.ai/api/v1/chat/completions'

const OPENROUTER_MODEL =
  import.meta.env
    .VITE_OPENROUTER_MODEL ||
  'qwen/qwen3-coder:free'

export async function consultarOpenRouter(
  prompt: string
) {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      'VITE_OPENROUTER_API_KEY no configurada'
    )
  }

  const respuesta =
    await fetch(
      OPENROUTER_URL,
      {
        method: 'POST',
        headers: {
          Authorization:
            `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type':
            'application/json',
          'HTTP-Referer':
            window.location.origin,
          'X-Title': 'Rayku',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'Eres Chef Rayku. Debes responder SIEMPRE con JSON válido y completo. No uses markdown ni texto fuera del JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.6,
          response_format: {
            type: 'json_object',
          },
        }),
      }
    )

  if (!respuesta.ok) {
    const texto =
      await respuesta.text()

    throw new Error(
      `Error OpenRouter ${respuesta.status}: ${texto}`
    )
  }

  const data =
    await respuesta.json()

  return String(
    data.choices?.[0]?.message
      ?.content || ''
  )
}