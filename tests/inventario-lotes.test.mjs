import test from 'node:test'
import assert from 'node:assert/strict'
import { combinarEntradaInventario } from '../src/lib/inventario/combinarLotes.ts'
const base={id:'a',nombre:'Mezcla de ensalada',cantidad:150,unidad:'g',ubicacion:'nevera',
 categoria:'verdura',fechaCaducidad:'2026-11-13',necesitaDescongelar:false}
test('suma cantidades de un mismo lote con nombre estandarizado',()=>{
 const nuevo={...base,id:'b',nombre:'mezcla de ENSALADA',cantidad:80}
 const resultado=combinarEntradaInventario([base],nuevo)
 assert.equal(resultado.length,1)
 assert.equal(resultado[0].cantidad,230)
 assert.equal(resultado[0].id,'a')
})
test('no mezcla productos con diferentes fechas de caducidad',()=>{
 const nuevo={...base,id:'b',cantidad:80,fechaCaducidad:'2026-11-18'}
 const resultado=combinarEntradaInventario([base],nuevo)
 assert.equal(resultado.length,2)
})
test('no mezcla congelador con nevera ni compra por colocar',()=>{
 assert.equal(combinarEntradaInventario([base],{...base,id:'c',ubicacion:'congelador'}).length,2)
 assert.equal(combinarEntradaInventario([{...base,ubicacion:'pendiente'}],{...base,id:'d',ubicacion:'pendiente'}).length,2)
})
test('no mezcla comida cocinada con productos crudos',()=>{
 assert.equal(combinarEntradaInventario([base],{...base,id:'b',esCocinado:true}).length,2)
})
