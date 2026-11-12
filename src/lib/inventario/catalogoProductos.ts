/**
 * Catálogo fijo: el producto se selecciona por nombre, y la cantidad/unidad se
 * guardan siempre en sus campos separados. No modifica registros históricos.
 */
export const CATALOGO_PRODUCTOS = {
  'Verduras y hortalizas': [
    'Acelgas','Ajo','Alcachofas','Apio','Berenjena','Brócoli','Calabacín','Calabaza',
    'Canónigos','Cebolla','Champiñones','Coliflor','Col lombarda','Espárragos',
    'Espinacas','Judías verdes','Lechuga','Lechuga iceberg','Lechuga romana',
    'Mezcla de ensalada','Nabo','Napicol','Patata','Pepino','Pimiento rojo',
    'Pimiento verde','Puerro','Rábanos','Repollo','Rúcula','Setas','Tomate',
    'Tomate cherry','Zanahoria','Boniato','Chirivía',
  ],
  'Frutas': [
    'Arándanos','Fresas','Frambuesas','Kiwi','Limón','Mandarina','Manzana',
    'Melocotón','Melón','Moras','Naranja','Pera','Piña','Plátano','Pomelo',
    'Sandía','Uvas','Aguacate',
  ],
  'Carne y aves': [
    'Alitas de pollo','Carne picada de cerdo','Carne picada de ternera',
    'Chuletas de cerdo','Chuletas de cordero','Conejo','Costillas de cerdo',
    'Entrecot de ternera','Filetes de ternera','Hígado de pollo',
    'Lomo de cerdo','Magro de cerdo','Muslos de pollo','Pechuga de pollo',
    'Pechuga de pavo','Pollo entero','Secreto de cerdo','Solomillo de cerdo',
    'Ternera para guisar','Traseros de pollo','Huesos para caldo',
    'Carcasa de pollo','Patas de pollo',
  ],
  'Pescado y marisco': [
    'Atún fresco','Atún en conserva','Bacalao','Caballa','Calamares',
    'Gambas','Langostinos','Lubina','Mejillones','Merluza','Pulpo',
    'Salmón','Sardinas','Sepia','Trucha',
  ],
  'Huevos y lácteos': [
    'Huevos','Leche entera','Leche semidesnatada','Leche sin lactosa',
    'Mantequilla','Mozzarella','Nata para cocinar','Nata para montar',
    'Parmesano','Queso cheddar','Queso crema','Queso de cabra',
    'Queso en lonchas','Queso fresco','Queso rallado','Queso curado',
    'Queso tierno','Requesón','Yogur natural','Yogur griego','Kéfir',
  ],
  'Embutidos y preparados': [
    'Bacon','Chorizo','Jamón cocido','Jamón serrano','Lacón',
    'Panceta','Salchichas','Longanizas','Morcilla','Ensalada preparada',
    'Caldo de pollo','Caldo de verduras','Caldo de carne','Bechamel',
    'Croquetas','Comida preparada',
  ],
  'Cereales y legumbres': [
    'Alubias cocidas','Arroz','Arroz integral','Avena','Cuscús',
    'Espaguetis','Fideos','Garbanzos cocidos','Harina de almendra',
    'Harina de trigo','Lentejas','Macarrones','Orzo','Pan','Pan de molde',
    'Pan rallado','Pasta de konjac','Quinoa','Tortillas de trigo',
  ],
  'Conservas, salsas y básicos': [
    'Aceite de oliva','Aceite de girasol','Aceitunas','Alioli',
    'Almendras','Atún en aceite','Azúcar','Cacao puro','Café',
    'Ghee','Levadura','Maíz dulce','Mayonesa','Miel','Mostaza',
    'Nueces','Pesto','Pimienta','Sal','Salsa de soja','Salsa de tomate',
    'Tomate triturado','Tomate frito','Vinagre','Vinagre de manzana',
  ],
  'Especias y hierbas': [
    'Albahaca','Canela','Comino','Cúrcuma','Curry','Eneldo',
    'Jengibre','Laurel','Nuez moscada','Orégano','Pimentón',
    'Perejil','Romero','Tomillo',
  ],
} as const

export const PRODUCTOS_CATALOGO = [...new Set(Object.values(CATALOGO_PRODUCTOS).flat())]
  .sort((a,b)=>a.localeCompare(b,'es'))

export function normalizarNombreCatalogo(nombre: string): string {
  return nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es')
    .replace(/\s+/g,' ').trim()
}
export function nombreProductoCatalogo(texto: string): string | null {
  const normal=normalizarNombreCatalogo(texto)
  return PRODUCTOS_CATALOGO.find(p=>normalizarNombreCatalogo(p)===normal) ?? null
}
export const UNIDADES_CATALOGO = ['g','kg','ml','l','u.','paquete','lata','bote','comida'] as const
