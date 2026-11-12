import test from 'node:test'
import assert from 'node:assert/strict'
import { compraManualParaInventario } from '../src/lib/compra/manualCheckout.ts'
const manual = (cantidad) => ({ id:'m1', nombre:'Leche', cantidad })

test('conserva cantidad y unidad de litros en la compra manual',()=>{
 assert.deepEqual(compraManualParaInventario(manual('2 litros')),{nombre:'Leche',cantidad:2,unidad:'l'})
})
test('admite decimal español y convierte a unidades normalizadas',()=>{
 assert.deepEqual(compraManualParaInventario(manual('0,75 kg')),{nombre:'Leche',cantidad:0.75,unidad:'kg'})
})
test('interpreta unidades discretas y gramos',()=>{
 assert.deepEqual(compraManualParaInventario(manual('12 uds')),{nombre:'Leche',cantidad:12,unidad:'u'})
 assert.deepEqual(compraManualParaInventario(manual('500 gramos')),{nombre:'Leche',cantidad:500,unidad:'g'})
})
test('mantiene notas libres visibles en lugar de perderlas',()=>{
 assert.deepEqual(compraManualParaInventario(manual('2 cajas grandes')),{nombre:'Leche (2 cajas grandes)',cantidad:null,unidad:null})
})
test('sin cantidad manual mantiene el comportamiento de entrada pendiente',()=>{
 assert.deepEqual(compraManualParaInventario(manual(null)),{nombre:'Leche',cantidad:null,unidad:null})
})
