import test from 'node:test'
import assert from 'node:assert/strict'
import {aplicarPlanMovimiento} from '../src/lib/replanificacionPure.ts'
const origen={id:'a',fecha:'2026-11-13',tipoComida:'comida',recetaId:'r',recetaIds:['r'],comidaLibre:'',nota:'',cocinado:false}
const ocupado={...origen,id:'b',fecha:'2026-11-15'}
test('traslada un plato sin perder receta ni notas',()=>{
 const resultado=aplicarPlanMovimiento([origen],{origenId:'a',nuevaFecha:'2026-11-16',nuevoTipo:'cena'},'2026-11-11')
 assert.equal(resultado?.[0].id,'a')
 assert.equal(resultado?.[0].recetaId,'r')
 assert.equal(resultado?.[0].fecha,'2026-11-16')
 assert.equal(resultado?.[0].tipoComida,'cena')
})
test('no sobrescribe comidas existentes',()=>{
 assert.equal(aplicarPlanMovimiento([origen,ocupado],{origenId:'a',nuevaFecha:'2026-11-15',nuevoTipo:'comida'},'2026-11-11'),null)
})
test('no modifica comidas cocinadas ni permite mover al pasado',()=>{
 assert.equal(aplicarPlanMovimiento([{...origen,cocinado:true}],{origenId:'a',nuevaFecha:'2026-11-17',nuevoTipo:'cena'},'2026-11-11'),null)
 assert.equal(aplicarPlanMovimiento([origen],{origenId:'a',nuevaFecha:'2026-11-10',nuevoTipo:'cena'},'2026-11-11'),null)
})
