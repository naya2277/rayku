import {
  redondearCantidad,
} from '../recetas/calcularIngredientesEscalados'

import type {
  IngredienteCompra,
  ItemInventarioListaCompra,
} from './types'

import {
  normalizarUnidadCompra,
  obtenerClaveIngredienteCompra,
} from './normalizacionCompra'

function claveDeIngredienteCompra(
  ingrediente:
    | string
    | IngredienteCompra
) {
  return typeof ingrediente === 'string'
    ? obtenerClaveIngredienteCompra(
        ingrediente
      )
    : ingrediente.clave
}

function obtenerTokensClave(
  clave: string
) {
  return clave
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function tokenValidoParaCoincidenciaParcial(
  token: string
) {
  return token.length >= 4
}

function clavesCoincidenExactasOParcialesSeguras(
  claveA: string,
  claveB: string
) {
  if (claveA === claveB) {
    return true
  }

  const tokensA =
    obtenerTokensClave(claveA)

  const tokensB =
    obtenerTokensClave(claveB)

  if (
    tokensA.length === 0 ||
    tokensB.length === 0
  ) {
    return false
  }

  const todosTokensBEnA =
    tokensB.every(
      (token) =>
        tokenValidoParaCoincidenciaParcial(
          token
        ) &&
        tokensA.includes(token)
    )

  const todosTokensAEnB =
    tokensA.every(
      (token) =>
        tokenValidoParaCoincidenciaParcial(
          token
        ) &&
        tokensB.includes(token)
    )

  return (
    todosTokensBEnA ||
    todosTokensAEnB
  )
}

function coincidenIngredientesCompra(
  ingredienteA:
    | string
    | IngredienteCompra,
  ingredienteB: string
) {
  const a =
    claveDeIngredienteCompra(
      ingredienteA
    )

  const b =
    obtenerClaveIngredienteCompra(
      ingredienteB
    )

  if (!a || !b) {
    return false
  }

  return clavesCoincidenExactasOParcialesSeguras(
    a,
    b
  )
}

function tieneStockDisponible(
  item: ItemInventarioListaCompra
) {
  if (item.ubicacion === 'pendiente') {
    return false
  }

  return Number(item.cantidad || 0) > 0
}

export function ingredienteEnInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  return inventario.some(
    (item) =>
      tieneStockDisponible(item) &&
      coincidenIngredientesCompra(
        ingrediente,
        item.nombre
      )
  )
}

export function cantidadesInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  return inventario
    .filter(
      (item) =>
        tieneStockDisponible(item) &&
        coincidenIngredientesCompra(
          ingrediente,
          item.nombre
        )
    )
    .map(
      (item) =>
        `${item.cantidad}${item.unidad}`
    )
    .join(' + ')
}

function calcularDisponible(
  ingrediente: IngredienteCompra,
  inventario: ItemInventarioListaCompra[]
) {
  if (
    ingrediente.cantidad === null ||
    !ingrediente.unidad
  ) {
    return null
  }

  return inventario.reduce(
    (total, item) => {
      if (!tieneStockDisponible(item)) {
        return total
      }

      const coincide =
        coincidenIngredientesCompra(
          ingrediente,
          item.nombre
        )

      if (!coincide) {
        return total
      }

      if (
        normalizarUnidadCompra(
          item.unidad
        ) !==
        normalizarUnidadCompra(
          ingrediente.unidad
        )
      ) {
        return total
      }

      return (
        total +
        Number(item.cantidad || 0)
      )
    },
    0
  )
}

export function separarIngredientesPorInventario(
  ingredientes: IngredienteCompra[],
  inventario: ItemInventarioListaCompra[]
) {
  const paraComprar: IngredienteCompra[] = []
  const yaDisponibles: IngredienteCompra[] = []

  // Cada lote del inventario se puede utilizar una sola vez. Sin este saldo
  // dos ingredientes parecidos podrían descontar el mismo producto dos veces.
  const saldo = inventario.map(item =>
    tieneStockDisponible(item) ? Math.max(0, Number(item.cantidad) || 0) : 0
  )
  const asignaciones = new Map<number, number>()
  const pendientes = ingredientes.map((ingrediente, indice) => ({ ingrediente, indice }))
  // Primero se atienden los nombres más específicos; "pechuga de pollo"
  // no debería perder su reserva frente a una petición genérica de "pollo".
  pendientes.sort((a,b) =>
    obtenerTokensClave(b.ingrediente.clave).length -
    obtenerTokensClave(a.ingrediente.clave).length
  )
  for (const { ingrediente, indice } of pendientes) {
    if (ingrediente.cantidad === null || !ingrediente.unidad) continue
    let restante = ingrediente.cantidad
    let asignado = 0
    const candidatos = inventario.map((item,i)=>({item,i})).filter(({item,i}) =>
      saldo[i] > 0 &&
      coincidenIngredientesCompra(ingrediente,item.nombre) &&
      normalizarUnidadCompra(item.unidad) === normalizarUnidadCompra(ingrediente.unidad)
    ).sort((a,b) =>
      Number(obtenerClaveIngredienteCompra(a.item.nombre) !== ingrediente.clave) -
      Number(obtenerClaveIngredienteCompra(b.item.nombre) !== ingrediente.clave)
    )
    for (const {i} of candidatos) {
      if (restante <= 0) break
      const tomado = Math.min(restante,saldo[i])
      saldo[i] -= tomado
      restante -= tomado
      asignado += tomado
    }
    asignaciones.set(indice,redondearCantidad(asignado))
  }

  ingredientes.forEach((ingrediente,indice) => {
    if (ingrediente.cantidad !== null && ingrediente.unidad) {
      const disponible = asignaciones.get(indice) ?? 0
      const faltante = Math.max(0,redondearCantidad(ingrediente.cantidad - disponible))
      const calculado = {
        ...ingrediente,
        cantidadDisponible: disponible,
        cantidadFaltante: faltante,
      }
      if (faltante > 0) paraComprar.push(calculado)
      else yaDisponibles.push(calculado)
      return
    }
    if (ingredienteEnInventario(ingrediente.nombre,inventario)) {
      yaDisponibles.push(ingrediente)
    } else {
      paraComprar.push(ingrediente)
    }
  })
  return { paraComprar, yaDisponibles }
}
