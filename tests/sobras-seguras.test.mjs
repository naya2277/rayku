import test from 'node:test'
import assert from 'node:assert/strict'
import {sobraProponible} from '../src/lib/sobrasSeguras.ts'
const lote={id:'x',nombre:'Preparación: Puchero',cantidad:2,unidad:'comida',ubicacion:'nevera',categoria:'otros',fechaPreparacion:'2026-11-10',fechaCaducidad:null,necesitaDescongelar:false,esCocinado:true}
test('sobras recientes en nevera se proponen con revisión manual',()=>{
 assert.equal(sobraProponible(lote,'2026-11-11'),true)
})
test('sobras sin caducidad tras varios días no se proponen',()=>{
 assert.equal(sobraProponible(lote,'2026-11-15'),false)
})
test('sobras sin fecha conocida no se suponen vigentes',()=>{
 assert.equal(sobraProponible({...lote,fechaPreparacion:null},'2026-11-11'),false)
})
test('no propone lote agotado o ya marcado como caducado',()=>{
 assert.equal(sobraProponible({...lote,cantidad:0},'2026-11-11'),false)
 assert.equal(sobraProponible({...lote,fechaCaducidad:'2026-11-10'},'2026-11-11'),false)
})
