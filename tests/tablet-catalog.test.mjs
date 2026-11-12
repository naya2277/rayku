import test from 'node:test'
import assert from 'node:assert/strict'
import { CATALOGO_VISUAL, PRODUCTOS_BASE, claveProductoVisual } from '../src/lib/tabletCatalog.ts'

test('navegación visual contiene niveles de carne, pollo y cortes concretos', () => {
 const carne = CATALOGO_VISUAL.find(c=>c.nombre==='Carne')
 const pollo = carne?.subcategorias.find(s=>s.nombre==='Pollo')
 assert.ok(pollo)
 assert.ok(pollo.productos.some(p=>p.nombre==='Pechuga entera de pollo'))
 assert.ok(pollo.productos.some(p=>p.nombre==='Pechuga de pollo fileteada'))
 assert.ok(pollo.productos.some(p=>p.nombre==='Muslos de pollo'))
})
test('categorías no alimentarias están presentes',()=>{
 const categorias = CATALOGO_VISUAL.map(c=>c.nombre)
 for(const name of ['Limpieza','Higiene','Mascotas','Hogar','Bebidas']) assert.ok(categorias.includes(name))
})
test('todos los productos tienen emoji y ruta de categoría/subcategoría única',()=>{
 assert.ok(PRODUCTOS_BASE.length>=100)
 const claves = PRODUCTOS_BASE.map(p=>{
  assert.ok(p.emoji)
  assert.ok(p.categoria && p.subcategoria && p.nombre)
  return claveProductoVisual(p)
 })
 assert.equal(new Set(claves).size,claves.length)
})
test('clave visual admite acentos y mayúsculas',()=>{
 assert.equal(claveProductoVisual({categoria:'Bébidas',subcategoria:'Víno',nombre:'Sangre de Judas'}),
              claveProductoVisual({categoria:'bebidas',subcategoria:'vino',nombre:'sangre de judas'}))
})
