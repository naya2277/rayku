export function normalizarIngrediente(
  ingrediente: string
) {
  return (
    ingrediente
      .toLowerCase()

      // quitar acentos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

      // quitar emojis
      .replace(
        /[\u{1F300}-\u{1FAFF}]/gu,
        ''
      )

      // quitar números
      .replace(/\d+/g, '')

      // quitar x4 / x 4
      .replace(/x\s*\d+/g, '')

      // quitar medidas
      .replace(
        /\b(g|kg|ml|l|cucharada|cucharadas|taza|tazas)\b/g,
        ''
      )

      // quitar caracteres raros
      .replace(/[^\p{L}\s]/gu, '')

      // singularizar algunas palabras comunes
      .replace(/\bhuevos\b/g, 'huevo')
      .replace(/\bchampinones\b/g, 'champinon')
      .replace(/\btomates\b/g, 'tomate')
      .replace(/\bpatatas\b/g, 'patata')
      .replace(/\bcebollas\b/g, 'cebolla')

      // espacios dobles
      .replace(/\s+/g, ' ')

      .trim()
  )
}

export function normalizarListaIngredientes(
  ingredientes: string[]
) {
  return ingredientes.map(
    normalizarIngrediente
  )
}