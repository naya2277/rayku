export function normalizarIngrediente(
  ingrediente: string
) {
  return (
    ingrediente
      .toLowerCase()

      // quitar emojis
      .replace(
        /[\u{1F300}-\u{1FAFF}]/gu,
        ''
      )

      // quitar números
      .replace(/\d+/g, '')

      // quitar x4 / x 4
      .replace(/x\s*\d+/g, '')

      // quitar gramos y medidas
      .replace(
        /\b(g|kg|ml|l|cucharada|cucharadas|taza|tazas)\b/g,
        ''
      )

      // quitar caracteres raros
      .replace(/[^\p{L}\s]/gu, '')

      // plurales simples
      .replace(/\bhuevos\b/g, 'huevo')

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