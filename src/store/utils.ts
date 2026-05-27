export const generarId = () => {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID()
  }

  return (
    Math.random()
      .toString(36)
      .substring(2) +
    Date.now().toString(36)
  )
}

export const cargar = <T,>(
  key: string,
  fallback: T
): T => {
  try {
    const raw =
      localStorage.getItem(key)

    if (!raw) return fallback

    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export const guardar = (
  key: string,
  data: unknown
) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(data)
    )
  } catch (error) {
    console.error(
      `Error guardando ${key}:`,
      error
    )
  }
}