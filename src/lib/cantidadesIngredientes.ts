export type IngredienteConCantidad = {
  original: string
  nombre: string
  cantidad: number | null
  unidad: string | null
}

const UNIDADES = [
  'kg',
  'g',
  'ml',
  'l',
  'u.',
  'u',
  'unidad',
  'unidades',
  'paquete',
  'paquetes',
  'lata',
  'latas',
]

export function separarTextoIngredientes(texto: string) {
  return texto
    .split(/[\n;]+|,(?=\s*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/)
    .map((i) => i.trim())
    .filter(Boolean)
}

export function normalizarUnidad(unidad: string) {
  const limpia = unidad.trim().toLowerCase()

  if (limpia === 'u') return 'u.'
  if (limpia === 'unidad') return 'u.'
  if (limpia === 'unidades') return 'u.'
  if (limpia === 'paquetes') return 'paquete'
  if (limpia === 'latas') return 'lata'

  return limpia
}

export function parsearIngredienteConCantidad(
  ingrediente: string
): IngredienteConCantidad {
  const original = ingrediente.trim()

  const unidadesRegex = UNIDADES.map((u) =>
    u.replace('.', '\\.')
  ).join('|')

  const inicio = original.match(
    new RegExp(
      `^(\\d+(?:[.,]\\d+)?)\\s*(${unidadesRegex})\\s+(.+)$`,
      'i'
    )
  )

  if (inicio) {
    return {
      original,
      cantidad: Number(inicio[1].replace(',', '.')),
      unidad: normalizarUnidad(inicio[2]),
      nombre: inicio[3].trim(),
    }
  }

  const final = original.match(
    new RegExp(
      `^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(${unidadesRegex})$`,
      'i'
    )
  )

  if (final) {
    return {
      original,
      nombre: final[1].trim(),
      cantidad: Number(final[2].replace(',', '.')),
      unidad: normalizarUnidad(final[3]),
    }
  }

  return {
    original,
    nombre: original,
    cantidad: null,
    unidad: null,
  }
}