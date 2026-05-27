export type IngredienteConCantidad = {
  original: string
  nombre: string
  cantidad: number | null
  unidad: string | null
}

const UNIDADES = [
  'kg',
  'g',
  'gr',
  'gramo',
  'gramos',
  'ml',
  'l',
  'litro',
  'litros',
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
    .split(/[\n;]+|,(?=\s*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9])/)
    .map((i) => i.trim())
    .filter(Boolean)
}

export function normalizarCantidadUnidad(
  cantidad: number,
  unidad: string
) {
  const limpia = unidad.trim().toLowerCase()

  if (
    limpia === 'kg'
  ) {
    return {
      cantidad: cantidad * 1000,
      unidad: 'g',
    }
  }

  if (
    limpia === 'gr' ||
    limpia === 'gramo' ||
    limpia === 'gramos'
  ) {
    return {
      cantidad,
      unidad: 'g',
    }
  }

  if (
    limpia === 'l' ||
    limpia === 'litro' ||
    limpia === 'litros'
  ) {
    return {
      cantidad: cantidad * 1000,
      unidad: 'ml',
    }
  }

  if (
    limpia === 'u' ||
    limpia === 'unidad' ||
    limpia === 'unidades'
  ) {
    return {
      cantidad,
      unidad: 'u.',
    }
  }

  if (limpia === 'paquetes') {
    return {
      cantidad,
      unidad: 'paquete',
    }
  }

  if (limpia === 'latas') {
    return {
      cantidad,
      unidad: 'lata',
    }
  }

  return {
    cantidad,
    unidad: limpia,
  }
}

export function normalizarUnidad(unidad: string) {
  return normalizarCantidadUnidad(
    1,
    unidad
  ).unidad
}

function leerNumero(valor: string) {
  return Number(valor.replace(',', '.'))
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
    const normalizado = normalizarCantidadUnidad(
      leerNumero(inicio[1]),
      inicio[2]
    )

    return {
      original,
      cantidad: normalizado.cantidad,
      unidad: normalizado.unidad,
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
    const normalizado = normalizarCantidadUnidad(
      leerNumero(final[2]),
      final[3]
    )

    return {
      original,
      nombre: final[1].trim(),
      cantidad: normalizado.cantidad,
      unidad: normalizado.unidad,
    }
  }

  return {
    original,
    nombre: original,
    cantidad: null,
    unidad: null,
  }
}