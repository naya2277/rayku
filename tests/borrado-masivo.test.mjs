import test from 'node:test'
import assert from 'node:assert/strict'
import {quitarDiasNoCocinados,quitarRegistrosPorId} from '../src/lib/borradoMasivo.ts'

const planning=[
 {id:'a',fecha:'2026-11-12',tipoComida:'comida',cocinado:false},
 {id:'b',fecha:'2026-11-12',tipoComida:'cena'},
 {id:'c',fecha:'2026-11-13',tipoComida:'comida',cocinado:true},
 {id:'d',fecha:'2026-11-13',tipoComida:'cena',cocinado:false},
 {id:'e',fecha:'2026-11-14',tipoComida:'cena'},
]
test('borra las dos comidas de un día de una sola vez',()=>{
 assert.deepEqual(quitarDiasNoCocinados(planning,['2026-11-12']).map(x=>x.id),['c','d','e'])
})
test('borra múltiples días sin eliminar comidas cocinadas ni días ajenos',()=>{
 assert.deepEqual(quitarDiasNoCocinados(planning,['2026-11-12','2026-11-13']).map(x=>x.id),['c','e'])
})
test('selección vacía o fechas no válidas no modifican el planning',()=>{
 assert.strictEqual(quitarDiasNoCocinados(planning,[]),planning)
 assert.strictEqual(quitarDiasNoCocinados(planning,['invalida']),planning)
})
test('borra muchos lotes con unidades distintas por identificador, no por nombre',()=>{
 const inventario=[{id:'1',nombre:'Leche',unidad:'l'}, {id:'2',nombre:'Leche',unidad:'ml'},
 {id:'3',nombre:'Huevos',unidad:'u'}, {id:'4',nombre:'Patatas',unidad:'kg'}]
 assert.deepEqual(quitarRegistrosPorId(inventario,['1','3','4']).map(x=>x.id),['2'])
})
test('no elimina artículos desconocidos ni registros si no hay selección',()=>{
 const inventario=[{id:'1'},{id:'2'}]
 assert.strictEqual(quitarRegistrosPorId(inventario,[]),inventario)
 assert.deepEqual(quitarRegistrosPorId(inventario,['99','1','1']).map(x=>x.id),['2'])
})
