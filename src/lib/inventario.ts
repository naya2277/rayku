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

export function detectarCaducidad(
  fecha: string | null
) {
  if (!fecha) return null

  const hoy = new Date()
  const caduca = new Date(fecha)

  const diff = Math.ceil(
    (caduca.getTime() - hoy.getTime()) /
      (1000 * 60 * 60 * 24)
  )

  if (diff < 0) {
    return {
      texto: '🔴 Caducado',
      color: '#8b0000',
      fondo: '#ffe0e0',
    }
  }

  if (diff === 0) {
    return {
      texto: '🔴 Caduca hoy',
      color: '#8b0000',
      fondo: '#ffe0e0',
    }
  }

  if (diff <= 3) {
    return {
      texto: `🟠 Caduca en ${diff} día${
        diff === 1 ? '' : 's'
      }`,
      color: '#9a5a00',
      fondo: '#fff1d6',
    }
  }

  return {
    texto: '🟢 Bien',
    color: '#407040',
    fondo: '#f1f8e9',
  }
}