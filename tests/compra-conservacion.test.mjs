import test from 'node:test'
import assert from 'node:assert/strict'
import { conservacionOrientativaDias, aplazarCompraFresh } from '../src/lib/compra/conservacionCompra.ts'

test('ensalada prevista para domingo no se debe comprar lunes',()=>{
 const dias=conservacionOrientativaDias('Mezcla de ensalada')
 assert.equal(dias,2)
 assert.equal(aplazarCompraFresh('2026-11-15','2026-11-09',dias),true)
 assert.equal(aplazarCompraFresh('2026-11-15','2026-11-13',dias),false)
})
test('ingrediente fresco de dos días se activa al acercarse su uso',()=>{
 assert.equal(aplazarCompraFresh('2026-11-15','2026-11-12',2),true)
 assert.equal(aplazarCompraFresh('2026-11-15','2026-11-14',2),false)
})
test('productos no perecederos se compran desde el inicio',()=>{
 assert.equal(conservacionOrientativaDias('Arroz'),null)
 assert.equal(aplazarCompraFresh('2026-11-15','2026-11-09',null),false)
})
test('pescado refrigerado se programa para el último momento',()=>{
 assert.equal(conservacionOrientativaDias('Salmón'),1)
 assert.equal(aplazarCompraFresh('2026-11-15','2026-11-13',1),true)
 assert.equal(aplazarCompraFresh('2026-11-15','2026-11-14',1),false)
})
