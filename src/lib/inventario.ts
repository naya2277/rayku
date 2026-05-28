export type UbicacionInventario =
  | 'pendiente'
  | 'nevera'
  | 'congelador'
  | 'despensa'

export const SECCIONES_INVENTARIO: {
  key: UbicacionInventario
  emoji: string
  label: string
  color: string
}[] = [
  {
    key: 'pendiente',
    emoji: '🛍️',
    label: 'Pendiente de guardar',
    color: '#fff0f6',
  },
  {
    key: 'nevera',
    emoji: '🧊',
    label: 'Nevera',
    color: '#e0f7f4',
  },
  {
    key: 'congelador',
    emoji: '❄️',
    label: 'Congelador',
    color: '#ede7f6',
  },
  {
    key: 'despensa',
    emoji: '🗄️',
    label: 'Despensa',
    color: '#fff8ee',
  },
]

export const CATEGORIAS_INVENTARIO = [
  {
    value: 'proteina',
    label: '🥩 Proteína',
  },
  {
    value: 'carbohidrato',
    label: '🍚 Carbohidrato',
  },
  {
    value: 'grasa',
    label: '🧈 Grasa',
  },
  {
    value: 'salsa',
    label: '🥣 Salsa',
  },
  {
    value: 'verdura',
    label: '🥦 Verdura',
  },
  {
    value: 'fruta',
    label: '🍓 Fruta',
  },
  {
    value: 'otros',
    label: '✨ Otros',
  },
]

export function calcularDiasCaducidad(
  fecha: string | null
) {
  if (!fecha) return null

  const hoy = new Date()
  const caduca = new Date(fecha)

  hoy.setHours(0, 0, 0, 0)
  caduca.setHours(0, 0, 0, 0)

  return Math.ceil(
    (caduca.getTime() - hoy.getTime()) /
      (1000 * 60 * 60 * 24)
  )
}

export function detectarCaducidad(
  fecha: string | null
) {
  const diff =
    calcularDiasCaducidad(fecha)

  if (diff === null) return null

  if (diff < 0) {
    return {
      texto: '🔴 Caducado',
      color: '#8b0000',
      fondo: '#ffe0e0',
      prioridad: 0,
    }
  }

  if (diff === 0) {
    return {
      texto: '🔴 Caduca hoy',
      color: '#8b0000',
      fondo: '#ffe0e0',
      prioridad: 1,
    }
  }

  if (diff <= 3) {
    return {
      texto: `🟠 Caduca en ${diff} día${
        diff === 1 ? '' : 's'
      }`,
      color: '#9a5a00',
      fondo: '#fff1d6',
      prioridad: 2,
    }
  }

  return {
    texto: '🟢 Bien',
    color: '#407040',
    fondo: '#f1f8e9',
    prioridad: 3,
  }
}

function normalizarUnidadStock(
  unidad: string
) {
  return unidad
    .toLowerCase()
    .trim()
    .replace(/\./g, '')
}

export function detectarStockBajo(
  cantidad: number,
  unidad: string
) {
  if (cantidad <= 0) {
    return null
  }

  const unidadNormalizada =
    normalizarUnidadStock(unidad)

  if (
    [
      'g',
      'gr',
      'grs',
      'gramo',
      'gramos',
    ].includes(
      unidadNormalizada
    ) &&
    cantidad <= 100
  ) {
    return {
      texto: `⚠️ Quedan ${cantidad}${unidad}`,
      prioridad: 1,
    }
  }

  if (
    [
      'ml',
      'mililitro',
      'mililitros',
    ].includes(
      unidadNormalizada
    ) &&
    cantidad <= 100
  ) {
    return {
      texto: `⚠️ Quedan ${cantidad}${unidad}`,
      prioridad: 1,
    }
  }

  if (
    [
      'kg',
      'kilo',
      'kilos',
      'kilogramo',
      'kilogramos',
    ].includes(
      unidadNormalizada
    ) &&
    cantidad <= 0.25
  ) {
    return {
      texto: `⚠️ Quedan ${cantidad}${unidad}`,
      prioridad: 1,
    }
  }

  if (
    [
      'l',
      'litro',
      'litros',
    ].includes(
      unidadNormalizada
    ) &&
    cantidad <= 0.25
  ) {
    return {
      texto: `⚠️ Quedan ${cantidad}${unidad}`,
      prioridad: 1,
    }
  }

  if (
    [
      'u',
      'ud',
      'uds',
      'unidad',
      'unidades',
    ].includes(
      unidadNormalizada
    ) &&
    cantidad <= 2
  ) {
    return {
      texto: `⚠️ Quedan ${cantidad}${unidad}`,
      prioridad: 1,
    }
  }

  if (
    [
      'paquete',
      'paquetes',
      'lata',
      'latas',
      'brick',
      'bricks',
    ].includes(
      unidadNormalizada
    ) &&
    cantidad <= 1
  ) {
    return {
      texto: `⚠️ Queda ${cantidad} ${unidad}`,
      prioridad: 1,
    }
  }

  return null
}