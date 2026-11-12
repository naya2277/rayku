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

test('fecha de caducidad futura no autoriza sobras refrigeradas antiguas',()=>{
 assert.equal(sobraProponible({...lote,fechaCaducidad:'2026-12-01'},'2026-11-15'),false)
})
test('no propone sobras sin fecha de preparación aunque tengan fecha de caducidad',()=>{
 assert.equal(sobraProponible({...lote,fechaPreparacion:null,fechaCaducidad:'2026-12-01'},'2026-11-11'),false)
})
test('no propone sobras fechadas en el futuro ni guardadas en despensa',()=>{
 assert.equal(sobraProponible({...lote,fechaPreparacion:'2026-11-13'},'2026-11-11'),false)
 assert.equal(sobraProponible({...lote,ubicacion:'despensa'},'2026-11-11'),false)
})
test('congelación admite fecha de preparación antigua pero nunca caducidad vencida',()=>{
 assert.equal(sobraProponible({...lote,ubicacion:'congelador'},'2026-12-01'),true)
 assert.equal(sobraProponible({...lote,ubicacion:'congelador',fechaCaducidad:'2026-11-20'},'2026-12-01'),false)
})
