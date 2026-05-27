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

const CATEGORIAS: Record<
  CategoriaIngrediente,
  string[]
> = {
  proteina: [
    'pollo',
    'pavo',
    'ternera',
    'cerdo',
    'vaca',
    'buey',
    'res',
    'carne',
    'carne picada',
    'picada',
    'lomo',
    'solomillo',
    'chuleta',
    'costilla',
    'secreto',
    'presa',
    'jamon',
    'jamon york',
    'jamon serrano',
    'bacon',
    'panceta',
    'chorizo',
    'salchicha',
    'longaniza',
    'hamburguesa',
    'hamburguesas',
    'albondiga',
    'albondigas',
    'huevo',
    'huevos',
    'atun',
    'salmon',
    'merluza',
    'bacalao',
    'sardina',
    'caballa',
    'pescado',
    'gamba',
    'gambas',
    'langostino',
    'langostinos',
    'mejillon',
    'mejillones',
    'calamar',
    'sepia',
    'tofu',
    'tempeh',
  ],

  carbohidrato: [
    'arroz',
    'pasta',
    'macarron',
    'macarrones',
    'espagueti',
    'espaguetis',
    'patata',
    'patatas',
    'boniato',
    'pan',
    'avena',
    'lenteja',
    'lentejas',
    'garbanzo',
    'garbanzos',
    'alubia',
    'alubias',
    'quinoa',
    'tortilla',
    'wrap',
    'harina',
    'maiz',
    'cuscus',
    'fideo',
    'fideos',
  ],

  grasa: [
    'aceite',
    'mantequilla',
    'ghee',
    'nata',
    'queso',
    'mozzarella',
    'parmesano',
    'cheddar',
    'emmental',
    'yogur griego',
    'aguacate',
    'nueces',
    'almendra',
    'almendras',
    'cacahuete',
    'cacahuetes',
    'mayonesa',
    'crema',
    'crema de cacahuete',
  ],

  salsa: [
    'salsa',
    'pesto',
    'tomate frito',
    'alioli',
    'bechamel',
    'mostaza',
    'ketchup',
    'soja',
    'caldo',
    'vinagreta',
    'barbacoa',
    'bbq',
    'chimichurri',
  ],

  verdura: [
    'brocoli',
    'calabacin',
    'lechuga',
    'espinaca',
    'espinacas',
    'zanahoria',
    'pepino',
    'pimiento',
    'cebolla',
    'tomate',
    'tomates',
    'cherry',
    'berenjena',
    'coliflor',
    'esparrago',
    'esparragos',
    'champinon',
    'champinones',
    'seta',
    'setas',
    'judia verde',
    'judias verdes',
    'apio',
    'puerro',
    'ajo',
    'col',
    'repollo',
    'rucula',
    'canonigos',
    'alcachofa',
    'alcachofas',
    'pepino',
    'calabaza',
  ],

  fruta: [
    'fresa',
    'fresas',
    'limon',
    'manzana',
    'platano',
    'naranja',
    'kiwi',
    'arandano',
    'arandanos',
    'frambuesa',
    'frambuesas',
    'pera',
    'melon',
    'sandia',
    'mora',
    'moras',
  ],

  otros: [],
}

const ORDEN_CATEGORIAS: CategoriaIngrediente[] = [
  'proteina',
  'verdura',
  'grasa',
  'salsa',
  'carbohidrato',
  'fruta',
  'otros',
]

export const detectarCategoriaIngrediente = (
  ingrediente: string
): CategoriaIngrediente => {
  const i =
    normalizarIngrediente(
      ingrediente
    )

  for (const categoria of ORDEN_CATEGORIAS) {
    if (
      CATEGORIAS[categoria].some(
        (palabra) =>
          i.includes(
            normalizarIngrediente(
              palabra
            )
          )
      )
    ) {
      return categoria
    }
  }

  return 'otros'
}

export const emojiIngrediente = (
  ingrediente: string
) => {
  const categoria =
    detectarCategoriaIngrediente(
      ingrediente
    )

  const emojis: Record<
    CategoriaIngrediente,
    string
  > = {
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
    detectarCategoriaIngrediente(
      ingrediente
    )

  const clases: Record<
    CategoriaIngrediente,
    string
  > = {
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