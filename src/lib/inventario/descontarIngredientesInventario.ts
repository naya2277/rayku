import type {
  ItemInventario,
} from '../../store/types'

import {
  normalizarIngrediente,
} from '../ingredientes'

import {
  redondearCantidad,
  type IngredienteEscalado,
} from '../recetas/calcularIngredientesEscalados'

function obtenerTokens(
  texto: string
) {
  return normalizarIngrediente(texto)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function clavesCoinciden(
  nombreInventario: string,
  nombreIngrediente: string
) {
  const tokensInventario =
    obtenerTokens(nombreInventario)

  const tokensIngrediente =
    obtenerTokens(nombreIngrediente)

  if (
    tokensInventario.length === 0 ||
    tokensIngrediente.length === 0
  ) {
    return false
  }

  const claveInventario =
    tokensInventario.join(' ')

  const claveIngrediente =
    tokensIngrediente.join(' ')

  if (
    claveInventario ===
    claveIngrediente
  ) {
    return true
  }

  return tokensIngrediente.every(
    (token) =>
      token.length >= 4 &&
      tokensInventario.includes(token)
  )
}

function normalizarUnidadInventario(
  unidad: string | null | undefined
) {
  if (!unidad) {
    return null
  }

  const limpia =
    unidad.toLowerCase().trim()

  if (
    [
      'g',
      'gr',
      'grs',
      'gramo',
      'gramos',
    ].includes(limpia)
  ) {
    return 'g'
  }

  if (
    [
      'kg',
      'kilo',
      'kilos',
      'kilogramo',
      'kilogramos',
    ].includes(limpia)
  ) {
    return 'kg'
  }

  if (
    [
      'ml',
      'mililitro',
      'mililitros',
    ].includes(limpia)
  ) {
    return 'ml'
  }

  if (
    [
      'l',
      'litro',
      'litros',
    ].includes(limpia)
  ) {
    return 'l'
  }

  if (
    [
      'u',
      'u.',
      'ud',
      'uds',
      'unidad',
      'unidades',
    ].includes(limpia)
  ) {
    return 'u'
  }

  if (
    [
      'comida',
      'comidas',
      'racion',
      'ración',
      'raciones',
    ].includes(limpia)
  ) {
    return 'comida'
  }

  return limpia
}

function unidadesCompatibles(
  unidadInventario: string | null | undefined,
  unidadIngrediente: string | null | undefined
) {
  if (
    !unidadInventario ||
    !unidadIngrediente
  ) {
    return false
  }

  return (
    normalizarUnidadInventario(
      unidadInventario
    ) ===
    normalizarUnidadInventario(
      unidadIngrediente
    )
  )
}

function prepararIngredienteParaDescuento(
  ingrediente: IngredienteEscalado,
  inventario: ItemInventario[]
) {
  if (
    ingrediente.cantidad !== null &&
    ingrediente.unidad
  ) {
    return {
      cantidad: ingrediente.cantidad,
      unidad: ingrediente.unidad,
    }
  }

  const existeComoComida =
    inventario.some(
      (item) =>
        item.ubicacion !== 'pendiente' &&
        item.cantidad > 0 &&
        normalizarUnidadInventario(
          item.unidad
        ) === 'comida' &&
        clavesCoinciden(
          item.nombre,
          ingrediente.nombre
        )
    )

  if (existeComoComida) {
    return {
      cantidad: 1,
      unidad: 'comida',
    }
  }

  return null
}

export function descontarIngredientesInventario(
  inventario: ItemInventario[],
  ingredientes: IngredienteEscalado[]
): ItemInventario[] {
  let nuevoInventario =
    [...inventario]

  ingredientes.forEach(
    (ingrediente) => {
      const ingredientePreparado =
        prepararIngredienteParaDescuento(
          ingrediente,
          nuevoInventario
        )

      if (!ingredientePreparado) {
        return
      }

      let cantidadPendiente =
        ingredientePreparado.cantidad

      nuevoInventario =
        nuevoInventario.map(
          (item) => {
            if (
              cantidadPendiente <= 0
            ) {
              return item
            }

            if (
              item.ubicacion ===
              'pendiente'
            ) {
              return item
            }

            const coincide =
              clavesCoinciden(
                item.nombre,
                ingrediente.nombre
              )

            const unidadCompatible =
              unidadesCompatibles(
                item.unidad,
                ingredientePreparado.unidad
              )

            if (
              !coincide ||
              !unidadCompatible
            ) {
              return item
            }

            const cantidadActual =
              Number(
                item.cantidad || 0
              )

            const cantidadADescontar =
              Math.min(
                cantidadActual,
                cantidadPendiente
              )

            cantidadPendiente =
              redondearCantidad(
                cantidadPendiente -
                  cantidadADescontar
              )

            return {
              ...item,
              cantidad:
                redondearCantidad(
                  cantidadActual -
                    cantidadADescontar
                ),
            }
          }
        )
    }
  )

  return nuevoInventario
}