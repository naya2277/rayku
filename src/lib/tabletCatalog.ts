export type ProductoVisual = {
  nombre: string
  emoji: string
  categoria: string
  subcategoria: string
}
type Subcategoria = { nombre: string; emoji: string; productos: readonly {nombre:string; emoji:string}[] }
type Categoria = { nombre:string; emoji:string; subcategorias: readonly Subcategoria[] }

export const CATALOGO_VISUAL: readonly Categoria[] = [
 { nombre:'Carne', emoji:'🥩', subcategorias:[
  {nombre:'Pollo',emoji:'🍗',productos:[
   {nombre:'Pechuga entera de pollo',emoji:'🍗'},{nombre:'Pechuga de pollo fileteada',emoji:'🍗'},
   {nombre:'Muslos de pollo',emoji:'🍗'},{nombre:'Contramuslos de pollo',emoji:'🍗'},
   {nombre:'Alitas de pollo',emoji:'🍗'},{nombre:'Pollo entero',emoji:'🍗'},
   {nombre:'Carcasa de pollo',emoji:'🍗'},{nombre:'Solomillos de pollo',emoji:'🍗'}]},
  {nombre:'Cerdo',emoji:'🥓',productos:[
   {nombre:'Chuletas de cerdo',emoji:'🥩'},{nombre:'Lomo de cerdo',emoji:'🥩'},
   {nombre:'Secreto de cerdo',emoji:'🥩'},{nombre:'Costillas de cerdo',emoji:'🥩'},
   {nombre:'Magro de cerdo',emoji:'🥩'},{nombre:'Panceta',emoji:'🥓'},
   {nombre:'Solomillo de cerdo',emoji:'🥩'},{nombre:'Carrillada de cerdo',emoji:'🥩'}]},
  {nombre:'Ternera',emoji:'🥩',productos:[
   {nombre:'Filetes de ternera',emoji:'🥩'},{nombre:'Ternera para guisar',emoji:'🥩'},
   {nombre:'Morcillo de ternera',emoji:'🥩'},{nombre:'Chuletón',emoji:'🥩'}]},
  {nombre:'Pavo y otros',emoji:'🦃',productos:[
   {nombre:'Pechuga de pavo',emoji:'🦃'},{nombre:'Muslos de pavo',emoji:'🦃'},
   {nombre:'Cordero',emoji:'🥩'},{nombre:'Jamón serrano',emoji:'🥓'}]}
 ]},
 {nombre:'Pescado y marisco',emoji:'🐟',subcategorias:[
  {nombre:'Pescado',emoji:'🐟',productos:[
   {nombre:'Salmón',emoji:'🐟'},{nombre:'Bacalao',emoji:'🐟'},{nombre:'Merluza',emoji:'🐟'},
   {nombre:'Dorada',emoji:'🐟'},{nombre:'Atún',emoji:'🐟'},{nombre:'Sardinas',emoji:'🐟'}]},
  {nombre:'Marisco',emoji:'🦐',productos:[
   {nombre:'Gambas',emoji:'🦐'},{nombre:'Langostinos',emoji:'🦐'},
   {nombre:'Mejillones',emoji:'🦪'},{nombre:'Calamares',emoji:'🦑'}]}
 ]},
 {nombre:'Verduras',emoji:'🥦',subcategorias:[
  {nombre:'Hortalizas',emoji:'🥕',productos:[
   {nombre:'Zanahorias',emoji:'🥕'},{nombre:'Tomates',emoji:'🍅'},{nombre:'Patatas',emoji:'🥔'},
   {nombre:'Boniato',emoji:'🍠'},{nombre:'Calabaza',emoji:'🎃'},{nombre:'Berenjena',emoji:'🍆'},
   {nombre:'Brócoli',emoji:'🥦'},{nombre:'Champiñones',emoji:'🍄'},
   {nombre:'Puerros',emoji:'🥬'},{nombre:'Cebolla',emoji:'🧅'}]},
  {nombre:'Ensaladas',emoji:'🥬',productos:[
   {nombre:'Lechuga',emoji:'🥬'},{nombre:'Canónigos',emoji:'🥬'},
   {nombre:'Espinacas',emoji:'🥬'},{nombre:'Rúcula',emoji:'🥬'},
   {nombre:'Mezcla de ensalada',emoji:'🥗'}]}
 ]},
 {nombre:'Fruta',emoji:'🍎',subcategorias:[
  {nombre:'Fruta fresca',emoji:'🍓',productos:[
   {nombre:'Manzanas',emoji:'🍎'},{nombre:'Plátanos',emoji:'🍌'},
   {nombre:'Naranjas',emoji:'🍊'},{nombre:'Mandarinas',emoji:'🍊'},
   {nombre:'Fresas',emoji:'🍓'},{nombre:'Uvas',emoji:'🍇'},
   {nombre:'Peras',emoji:'🍐'},{nombre:'Limones',emoji:'🍋'}]},
  {nombre:'Frutos secos',emoji:'🥜',productos:[
   {nombre:'Almendras',emoji:'🥜'},{nombre:'Nueces',emoji:'🌰'},
   {nombre:'Pistachos',emoji:'🥜'}]}
 ]},
 {nombre:'Lácteos y huevos',emoji:'🥛',subcategorias:[
  {nombre:'Lácteos',emoji:'🥛',productos:[
   {nombre:'Leche entera',emoji:'🥛'},{nombre:'Nata de cocinar',emoji:'🥛'},
   {nombre:'Yogur natural',emoji:'🥛'},{nombre:'Mantequilla',emoji:'🧈'}]},
  {nombre:'Quesos',emoji:'🧀',productos:[
   {nombre:'Queso rallado',emoji:'🧀'},{nombre:'Queso en lonchas',emoji:'🧀'},
   {nombre:'Queso fresco',emoji:'🧀'},{nombre:'Mozzarella',emoji:'🧀'}]},
  {nombre:'Huevos',emoji:'🥚',productos:[{nombre:'Huevos L',emoji:'🥚'},{nombre:'Huevos M',emoji:'🥚'}]}
 ]},
 {nombre:'Despensa',emoji:'🫙',subcategorias:[
  {nombre:'Pasta y arroz',emoji:'🍚',productos:[
   {nombre:'Arroz',emoji:'🍚'},{nombre:'Orzo',emoji:'🍝'},{nombre:'Macarrones',emoji:'🍝'},
   {nombre:'Espaguetis',emoji:'🍝'},{nombre:'Cuscús',emoji:'🍚'}]},
  {nombre:'Legumbres',emoji:'🫘',productos:[
   {nombre:'Garbanzos cocidos',emoji:'🫘'},{nombre:'Garbanzos secos',emoji:'🫘'},
   {nombre:'Lentejas',emoji:'🫘'},{nombre:'Alubias',emoji:'🫘'}]},
  {nombre:'Conservas y salsas',emoji:'🥫',productos:[
   {nombre:'Atún en conserva',emoji:'🥫'},{nombre:'Tomate triturado',emoji:'🥫'},
   {nombre:'Mayonesa',emoji:'🥫'},{nombre:'Caldo de pollo',emoji:'🥣'},
   {nombre:'Aceite de oliva',emoji:'🫒'}]},
  {nombre:'Pan y repostería',emoji:'🍞',productos:[
   {nombre:'Pan de molde',emoji:'🍞'},{nombre:'Harina',emoji:'🌾'},
   {nombre:'Azúcar',emoji:'🍬'},{nombre:'Levadura',emoji:'🥖'}]}
 ]},
 {nombre:'Bebidas',emoji:'🥤',subcategorias:[
  {nombre:'Agua y refrescos',emoji:'💧',productos:[
   {nombre:'Agua mineral',emoji:'💧'},{nombre:'Agua con gas',emoji:'💦'},
   {nombre:'Refresco de cola',emoji:'🥤'},{nombre:'Zumo',emoji:'🧃'}]},
  {nombre:'Café y té',emoji:'☕',productos:[
   {nombre:'Café molido',emoji:'☕'},{nombre:'Cápsulas de café',emoji:'☕'},
   {nombre:'Té',emoji:'🫖'}]},
  {nombre:'Otras bebidas',emoji:'🍷',productos:[
   {nombre:'Vino',emoji:'🍷'},{nombre:'Cerveza',emoji:'🍺'},
   {nombre:'Licor',emoji:'🥃'}]}
 ]},
 {nombre:'Congelados',emoji:'🧊',subcategorias:[
  {nombre:'Verduras congeladas',emoji:'🥦',productos:[
   {nombre:'Brócoli congelado',emoji:'🥦'},{nombre:'Espinacas congeladas',emoji:'🥬'}]},
  {nombre:'Otros congelados',emoji:'❄️',productos:[
   {nombre:'Pescado congelado',emoji:'🐟'},{nombre:'Patatas congeladas',emoji:'🍟'},
   {nombre:'Helado',emoji:'🍦'}]}
 ]},
 {nombre:'Limpieza',emoji:'🧹',subcategorias:[
  {nombre:'Ropa',emoji:'🧺',productos:[
   {nombre:'Detergente para ropa',emoji:'🫧'},{nombre:'Suavizante',emoji:'🧺'},
   {nombre:'Quitamanchas',emoji:'🧴'}]},
  {nombre:'Cocina',emoji:'🧽',productos:[
   {nombre:'Lavavajillas',emoji:'🧽'},{nombre:'Pastillas lavavajillas',emoji:'🫧'},
   {nombre:'Estropajos',emoji:'🧽'},{nombre:'Papel de cocina',emoji:'🧻'}]},
  {nombre:'Baño y suelos',emoji:'🧹',productos:[
   {nombre:'Limpiador de baños',emoji:'🧽'},{nombre:'Limpiador de suelos',emoji:'🧹'},
   {nombre:'Bolsas de basura',emoji:'🗑️'},{nombre:'Lejía',emoji:'🧴'}]}
 ]},
 {nombre:'Higiene',emoji:'🧴',subcategorias:[
  {nombre:'Ducha y cabello',emoji:'🛀',productos:[
   {nombre:'Gel de ducha',emoji:'🧴'},{nombre:'Champú',emoji:'🧴'},
   {nombre:'Acondicionador',emoji:'🧴'},{nombre:'Desodorante',emoji:'🧴'}]},
  {nombre:'Dental',emoji:'🪥',productos:[
   {nombre:'Pasta de dientes',emoji:'🪥'},{nombre:'Cepillos de dientes',emoji:'🪥'}]},
  {nombre:'Papel e higiene íntima',emoji:'🧻',productos:[
   {nombre:'Papel higiénico',emoji:'🧻'},{nombre:'Compresas',emoji:'🩷'},
   {nombre:'Toallitas',emoji:'🧻'}]}
 ]},
 {nombre:'Mascotas',emoji:'🐾',subcategorias:[
  {nombre:'Alimentación',emoji:'🐾',productos:[
   {nombre:'Pienso para mascotas',emoji:'🐾'},{nombre:'Comida húmeda',emoji:'🥫'}]},
  {nombre:'Cuidado',emoji:'🪮',productos:[
   {nombre:'Bolsas para excrementos',emoji:'🐕'},{nombre:'Arena para mascotas',emoji:'🐾'}]}
 ]},
 {nombre:'Hogar',emoji:'🏠',subcategorias:[
  {nombre:'Consumibles',emoji:'🧻',productos:[
   {nombre:'Servilletas',emoji:'🧻'},{nombre:'Papel aluminio',emoji:'📦'},
   {nombre:'Film alimentario',emoji:'📦'},{nombre:'Pilas',emoji:'🔋'}]}
 ]}
]

export const PRODUCTOS_BASE: ProductoVisual[] = CATALOGO_VISUAL.flatMap(c =>
  c.subcategorias.flatMap(s => s.productos.map(p => ({
    ...p,categoria:c.nombre,subcategoria:s.nombre
  })))
)

export function claveProductoVisual(producto: Pick<ProductoVisual,'categoria'|'subcategoria'|'nombre'>): string {
 return [producto.categoria,producto.subcategoria,producto.nombre]
  .map(x => x.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,''))
  .join('|')
}
