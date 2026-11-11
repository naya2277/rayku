import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeSharedWorkspace } from '../src/lib/mergeSharedWorkspace.ts'

const recipe=(id,nombre)=>({id,nombre})
const plan=(id,fecha,recetaId)=>({id,fecha,tipoComida:'comida',recetaId})
test('combina dos recetas nuevas sin borrar ninguna',()=>{
 const base=[recipe('a','A')]
 const local=[...base,recipe('b','B')]
 const remote=[...base,recipe('c','C')]
 const merged=mergeSharedWorkspace('recipes',base,local,remote)
 assert.deepEqual(merged.map(x=>x.id),['a','c','b'])
})
test('respeta modificaciones diferentes sobre recetas distintas',()=>{
 const base=[recipe('a','A'),recipe('b','B')]
 const local=[recipe('a','A editada'),recipe('b','B')]
 const remote=[recipe('a','A'),recipe('b','B editada')]
 const merged=mergeSharedWorkspace('recipes',base,local,remote)
 assert.deepEqual(merged.map(x=>x.nombre),['A editada','B editada'])
})
test('no combina cambios contradictorios sobre la misma receta',()=>{
 const base=[recipe('a','A')]
 assert.throws(()=>mergeSharedWorkspace('recipes',base,[recipe('a','X')],[recipe('a','Y')]),/mismo elemento/)
})
test('no resucita una receta borrada en otro dispositivo',()=>{
 const base=[recipe('a','A'),recipe('b','B')]
 assert.deepEqual(mergeSharedWorkspace('recipes',base,base,[recipe('b','B')]).map(x=>x.id),['b'])
})
test('detecta dos platos distintos para el mismo día y turno',()=>{
 const base=[]
 const local=[plan('uno','2026-11-15','receta-1')]
 const remote=[plan('dos','2026-11-15','receta-2')]
 assert.throws(()=>mergeSharedWorkspace('planning',base,local,remote),/mismo elemento/)
})
test('combina dos días independientes del planning',()=>{
 const merged=mergeSharedWorkspace('planning',[],[plan('uno','2026-11-15','r1')],[plan('dos','2026-11-16','r2')])
 assert.equal(merged.length,2)
})
test('combina nuevos ítems y checks de compra',()=>{
 const base={compraManual:[],checksCompra:[]}
 const local={compraManual:[{id:'a',nombre:'A'}],checksCompra:['manual-a']}
 const remote={compraManual:[{id:'b',nombre:'B'}],checksCompra:['manual-b']}
 const merged=mergeSharedWorkspace('shopping_list',base,local,remote)
 assert.deepEqual(merged.compraManual.map(x=>x.id),['b','a'])
 assert.deepEqual(merged.checksCompra,['manual-b','manual-a'])
})
