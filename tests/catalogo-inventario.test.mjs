import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTOS_CATALOGO, nombreProductoCatalogo, normalizarNombreCatalogo } from '../src/lib/inventario/catalogoProductos.ts'

test('el catálogo nunca contiene cantidades dentro del nombre',()=>{
 assert.equal(PRODUCTOS_CATALOGO.some(nombre=>/\b\d+\s*(?:g|kg|ml|l|ud)\b/i.test(nombre)),false)
})
test('ensalada usa un nombre fijo y cantidad separada',()=>{
 assert.equal(nombreProductoCatalogo('mezcla de ENSALADA'),'Mezcla de ensalada')
 assert.equal(nombreProductoCatalogo('Mezcla de ensalada 150 gramos'),null)
})
test('no hay nombres duplicados al ignorar tildes y mayúsculas',()=>{
 const normalizados=PRODUCTOS_CATALOGO.map(normalizarNombreCatalogo)
 assert.equal(new Set(normalizados).size,normalizados.length)
})
