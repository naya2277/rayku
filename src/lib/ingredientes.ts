import { normalizarIngrediente } from './recetas/helpers'

export type CategoriaIngrediente =
  | 'proteina'
  | 'carbohidrato'
  | 'grasa'
  | 'salsa'
  | 'verdura'
  | 'fruta'
  | 'otros'

export { normalizarIngrediente }

export const detectarCategoriaIngrediente = (
  ingrediente: string
): CategoriaIngrediente => {
  const i = normalizarIngrediente(ingrediente)

  if (
    [
      'pollo',
      'pavo',
      'ternera',
      'cerdo',
      'huevo',
      'atun',
      'salmon',
      'merluza',
      'gamba',
      'pescado',
      'carne',
      'lomo',
      'jamon',
      'bacon',
    ].some((p) => i.includes(p))
  ) {
    return 'proteina'
  }

  if (
    [
      'arroz',
      'pasta',
      'macarron',
      'espagueti',
      'patata',
      'pan',
      'avena',
      'lenteja',
      'garbanzo',
      'alubia',
      'quinoa',
      'tortilla',
      'wrap',
      'harina',
    ].some((p) => i.includes(p))
  ) {
    return 'carbohidrato'
  }

  if (
    [
      'aceite',
      'mantequilla',
      'nata',
      'queso',
      'aguacate',
      'nueces',
      'almendra',
      'mayonesa',
      'crema',
    ].some((p) => i.includes(p))
  ) {
    return 'grasa'
  }

  if (
    [
      'salsa',
      'pesto',
      'tomate frito',
      'alioli',
      'bechamel',
      'mostaza',
      'ketchup',
      'soja',
      'caldo',
    ].some((p) => i.includes(p))
  ) {
    return 'salsa'
  }

  if (
    [
      'brocoli',
      'calabacin',
      'lechuga',
      'espinaca',
      'zanahoria',
      'pepino',
      'pimiento',
      'cebolla',
      'tomate',
      'berenjena',
      'coliflor',
      'esparrago',
      'champinon',
      'seta',
      'judia verde',
    ].some((p) => i.includes(p))
  ) {
    return 'verdura'
  }

  if (
    [
      'fresa',
      'limon',
      'manzana',
      'platano',
      'naranja',
      'kiwi',
      'arandano',
      'frambuesa',
      'pera',
      'melon',
      'sandia',
    ].some((p) => i.includes(p))
  ) {
    return 'fruta'
  }

  return 'otros'
}

export const emojiIngrediente = (
  ingrediente: string
) => {
  const categoria =
    detectarCategoriaIngrediente(ingrediente)

  const emojis: Record<CategoriaIngrediente, string> = {
    proteina: '🥩',
    carbohidrato: '🍚',
    grasa: '🧈',
    salsa: '🥣',
    verdura: '🥦',
    fruta: '🍓',
    otros: '✨',
  }

  return emojis[categoria]
}

export const claseIngrediente = (
  ingrediente: string
) => {
  const categoria =
    detectarCategoriaIngrediente(ingrediente)

  const clases: Record<CategoriaIngrediente, string> = {
    proteina: 'pill-naranja',
    carbohidrato: 'pill-malva',
    grasa: 'pill-rosa',
    salsa: 'pill-teal',
    verdura: 'pill-verde',
    fruta: 'pill-rosa',
    otros: 'pill-malva',
  }

  return clases[categoria]
}

export const separarIngredientes = (
  texto: string
) =>
  texto
    .split(/,|\+|\n/)
    .map((i) => i.trim())
    .filter(Boolean)