const SINONIMOS_INGREDIENTES: Record<string, string> = {
  huevos: 'huevo',
  tomates: 'tomate',
  patatas: 'patata',
  cebollas: 'cebolla',
  zanahorias: 'zanahoria',
  pimientos: 'pimiento',
  berenjenas: 'berenjena',
  esparragos: 'esparrago',
  espinacas: 'espinaca',
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

const FRASES_A_ELIMINAR = [
  'si se necesita',
  'si hace falta',
  'opcional',
  'al gusto',
  'para decorar',
  'para gratinar',
  'para freir',
  'para freír',
  'para cocinar',
  'aproximadamente',
  'cantidad necesaria',
  'un poco de',
]

const PALABRAS_RELLENO = [
  'y',
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

function quitarAcentos(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function normalizarIngredienteRayku(
  ingrediente: string
) {
  let texto =
    quitarAcentos(
      ingrediente.toLowerCase()
    )

  texto = texto
    .replace(
      /[\u{1F300}-\u{1FAFF}]/gu,
      ''
    )
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\d+(?:[.,]\d+)?/g, ' ')
    .replace(/x\s*\d+/g, ' ')
    .replace(
      /\b(kg|g|gr|gramo|gramos|ml|l|litro|litros|u|ud|uds|unidad|unidades|paquete|paquetes|lata|latas|comida|comidas|racion|raciones|cucharada|cucharadas|taza|tazas)\b/g,
      ' '
    )

  FRASES_A_ELIMINAR.forEach((frase) => {
    texto = texto.replaceAll(
      quitarAcentos(frase),
      ' '
    )
  })

  const palabras =
    texto
      .replace(/[^\p{L}\s]/gu, ' ')
      .split(/\s+/)
      .map((palabra) => palabra.trim())
      .filter(Boolean)
      .map(
        (palabra) =>
          SINONIMOS_INGREDIENTES[
            palabra
          ] ?? palabra
      )
      .filter(
        (palabra) =>
          !PALABRAS_RELLENO.includes(
            palabra
          )
      )

  const limpio =
    palabras
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

  const reglas: Array<[RegExp, string]> = [
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
    [
      /\bqueso\b.*\brallado\b|\brallado\b.*\bqueso\b/,
      'queso rallado',
    ],
    [
      /\bespinaca\b.*\bbaby\b|\bbaby\b.*\bespinaca\b/,
      'espinaca',
    ],
  ]

  const regla =
    reglas.find(([regex]) =>
      regex.test(limpio)
    )

  return regla ? regla[1] : limpio
}