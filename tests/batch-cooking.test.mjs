import test from 'node:test'
import assert from 'node:assert/strict'
import {crearLoteCocinado,validarPreparacionLote} from '../src/lib/batchCooking.ts'
const base={recetaNombre:'Puchero',raciones:4,ubicacion:'congelador',fechaPreparacion:'2026-11-11',fechaCaducidad:null,fechaDescongelar:'2026-11-15'}
test('prepara lote cocinado con raciones y aviso de descongelación',()=>{
 const item=crearLoteCocinado(base,'lote-1')
 assert.equal(item.nombre,'Preparación: Puchero')
 assert.equal(item.cantidad,4)
 assert.equal(item.unidad,'comida')
 assert.equal(item.esCocinado,true)
 assert.equal(item.ubicacion,'congelador')
 assert.equal(item.fechaDescongelar,'2026-11-15')
})
test('no permite mezclar fecha de caducidad previa a la elaboración',()=>{
 assert.match(validarPreparacionLote({...base,fechaCaducidad:'2026-11-10'}),/caducidad/)
})
test('solo acepta raciones enteras y mayores que cero',()=>{
 assert.match(validarPreparacionLote({...base,raciones:0}),/raciones/)
 assert.match(validarPreparacionLote({...base,raciones:1.5}),/raciones/)
})
test('no programa descongelación antes de haber cocinado',()=>{
 assert.match(validarPreparacionLote({...base,fechaDescongelar:'2026-11-10'}),/descongelar/)
})
test('un lote guardado en nevera no programa descongelación',()=>{
 assert.match(validarPreparacionLote({...base,ubicacion:'nevera'}),/congelado/)
})
