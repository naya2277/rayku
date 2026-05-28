import {
  normalizarIngrediente,
} from '../ingredientes'

const PALABRAS_RELLENO = [
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'para',
  'tipo',
]

const SINONIMOS: Record<string, string> = {
  tomates: 'tomate',
  cherrys: 'cherry',
  huevos: 'huevo',
  patatas: 'patata',
  cebollas: 'cebolla',
  zanahorias: 'zanahoria',
  pimientos: 'pimiento',
  berenjenas: 'berenjena',
  esparragos: 'esparrago',
  champinones: 'champinon',
  setas: 'seta',
  alcachofas: 'alcachofa',
  albondigas: 'albondiga',
  hamburguesas: 'hamburguesa',
  gambas: 'gamba',
  langostinos: 'langostino',
  mejillones: 'mejillon',
  sardinas: 'sardina',
  lentejas: 'lenteja',
  garbanzos: 'garbanzo',
  alubias: 'alubia',
  macarrones: 'macarron',
  espaguetis: 'espagueti',
  almendras: 'almendra',
  nueces: 'nuez',
  fresas: 'fresa',
  arandanos: 'arandano',
  frambuesas: 'frambuesa',
  moras: 'mora',
}

export function normalizarUnidadCompra(
  unidad: string | null
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
      'ud',
      'uds',
      'unidad',
      'unidades',
    ].includes(limpia)
  ) {
    return 'u'
  }

  return limpia
}

function limpiarClaveIngrediente(
  ingrediente: string
) {
  return normalizarIngrediente(
    ingrediente
  )
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .map(
      (palabra) =>
        SINONIMOS[palabra] ||
        palabra
    )
    .filter(
      (palabra) =>
        palabra &&
        !PALABRAS_RELLENO.includes(
          palabra
        )
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function obtenerClaveIngredienteCompra(
  ingrediente: string
) {
  const limpio =
    limpiarClaveIngrediente(
      ingrediente
    )

  const reglas: Array<[RegExp, string]> =
    [
      [
        /\btomate\b.*\bcherry\b|\bcherry\b.*\btomate\b/,
        'tomate cherry',
      ],
      [
        /\bcarne\b.*\bpicada\b|\bpicada\b.*\bcarne\b/,
        'carne picada',
      ],
      [
        /\bjamon\b.*\byork\b|\byork\b.*\bjamon\b/,
        'jamon york',
      ],
      [
        /\bjamon\b.*\bserrano\b|\bserrano\b.*\bjamon\b/,
        'jamon serrano',
      ],
      [
        /\byogur\b.*\bgriego\b|\bgriego\b.*\byogur\b/,
        'yogur griego',
      ],
      [
        /\bcrema\b.*\bcacahuete\b|\bcacahuete\b.*\bcrema\b/,
        'crema de cacahuete',
      ],
      [
        /\bjudia\b.*\bverde\b|\bverde\b.*\bjudia\b/,
        'judia verde',
      ],
    ]

  const regla =
    reglas.find(
      ([regex]) =>
        regex.test(limpio)
    )

  return regla ? regla[1] : limpio
}

export function unidadesCompraCompatibles(
  unidadA: string | null,
  unidadB: string | null
) {
  if (!unidadA || !unidadB) {
    return false
  }

  return (
    normalizarUnidadCompra(unidadA) ===
    normalizarUnidadCompra(unidadB)
  )
}