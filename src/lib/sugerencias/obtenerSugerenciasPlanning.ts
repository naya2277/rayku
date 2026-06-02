import type {
  ItemInventario,
  Receta,
  TipoComida,
} from '../../store/types'

export type SugerenciaPlanning = {
  receta: Receta
  puntuacion: number
  motivo: string
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function obtenerTextoReceta(receta: Receta) {
  return [
    receta.nombre,
    receta.ingredientes.join(' '),
    receta.ingredientesBase.join(' '),
    receta.dietas.join(' '),
    receta.caracteristicas.join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

function recetaCoincideConInventario(
  receta: Receta,
  inventario: ItemInventario[]
) {
  const productosDisponibles =
    inventario
      .filter(
        (item) =>
          item.ubicacion !== 'pendiente' &&
          item.cantidad > 0
      )
      .map((item) =>
        normalizarTexto(item.nombre)
      )

  if (productosDisponibles.length === 0) {
    return {
      coincidencias: 0,
      tieneTodo: false,
    }
  }

  const ingredientesBase =
    receta.ingredientesBase.length > 0
      ? receta.ingredientesBase
      : receta.ingredientes

  const ingredientesNormalizados =
    ingredientesBase
      .map((ingrediente) =>
        normalizarTexto(ingrediente)
      )
      .filter(Boolean)

  if (ingredientesNormalizados.length === 0) {
    return {
      coincidencias: 0,
      tieneTodo: false,
    }
  }

  const coincidencias =
    ingredientesNormalizados.filter(
      (ingrediente) =>
        productosDisponibles.some(
          (producto) =>
            producto.includes(ingrediente) ||
            ingrediente.includes(producto)
        )
    ).length

  return {
    coincidencias,
    tieneTodo:
      coincidencias > 0 &&
      coincidencias === ingredientesNormalizados.length,
  }
}

function obtenerMotivo({
  tieneTodo,
  coincidencias,
  receta,
  coincideTipoComida,
}: {
  tieneTodo: boolean
  coincidencias: number
  receta: Receta
  coincideTipoComida: boolean
}) {
  if (tieneTodo) {
    return 'Tienes todos o casi todos los ingredientes en casa ✅'
  }

  if (coincidencias >= 2) {
    return `Aprovecha ${coincidencias} ingredientes que ya tienes 🧺`
  }

  if (receta.favorita) {
    return 'Es una de tus recetas favoritas 💜'
  }

  if (receta.valoracion >= 4) {
    return 'La tienes muy bien valorada ⭐'
  }

  if (coincideTipoComida) {
    return 'Encaja bien para este tipo de comida 🍽️'
  }

  return 'Puede ser buena opción para este hueco ✨'
}

export function obtenerSugerenciasPlanning({
  recetas,
  inventario,
  tipoComida,
  recetaIdsActuales,
}: {
  recetas: Receta[]
  inventario: ItemInventario[]
  tipoComida: TipoComida
  recetaIdsActuales: string[]
}) {
  return recetas
    .filter(
      (receta) =>
        !recetaIdsActuales.includes(receta.id)
    )
    .map((receta) => {
      const {
        coincidencias,
        tieneTodo,
      } =
        recetaCoincideConInventario(
          receta,
          inventario
        )

      const textoReceta =
        obtenerTextoReceta(receta)

      const coincideTipoComida =
        receta.tiposComida.some(
          (tipo) =>
            normalizarTexto(tipo).includes(
              tipoComida
            )
        ) ||
        textoReceta.includes(tipoComida)

      let puntuacion = 0

      if (tieneTodo) {
        puntuacion += 50
      }

      puntuacion += coincidencias * 8

      if (receta.favorita) {
        puntuacion += 20
      }

      if (receta.valoracion >= 4) {
        puntuacion += 15
      }

      if (coincideTipoComida) {
        puntuacion += 10
      }

      if (
        receta.caracteristicas.some(
          (caracteristica) =>
            normalizarTexto(caracteristica).includes('rapida') ||
            normalizarTexto(caracteristica).includes('rapido')
        )
      ) {
        puntuacion += 5
      }

      return {
        receta,
        puntuacion,
        motivo: obtenerMotivo({
          tieneTodo,
          coincidencias,
          receta,
          coincideTipoComida,
        }),
      }
    })
    .filter(
      (sugerencia) =>
        sugerencia.puntuacion > 0
    )
    .sort(
      (a, b) =>
        b.puntuacion - a.puntuacion
    )
    .slice(0, 5)
}