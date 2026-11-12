import test from 'node:test'
import assert from 'node:assert/strict'
import { revisarRespuestaChefRayku } from '../src/lib/chef-rayku/revisarRespuesta.ts'

const idea=(nombre,ingredientes=['200 g pollo','30 g queso'])=>({
  nombre,ingredientes,pasos:'1. Preparar los ingredientes.\n2. Cocinar el plato.',origen:'nueva'
})
const answer=(ideas)=>JSON.stringify({titulo:'Chef Rayku',ideas})

test('mantiene recetas nuevas compatibles',()=>{
  const x=revisarRespuestaChefRayku(answer([idea('Pollo cremoso')]),'ideas_recetas',['cebolla'],['Keto'],[])
  assert.equal(x.validas,1)
  assert.equal(x.descartadas,0)
})
test('elimina ingredientes prohibidos incluyendo variantes plurales',()=>{
  const x=revisarRespuestaChefRayku(answer([idea('Pollo con pimientos',['pollo','pimientos rojos']),idea('Pollo con queso')]),'ideas_recetas',['pimiento'],['Keto'],[])
  assert.equal(x.validas,1)
  assert.equal(x.descartadas,1)
})
test('elimina platos keto con alimentos incompatibles obvios',()=>{
  const x=revisarRespuestaChefRayku(answer([idea('Risotto',['100 g arroz','pollo']),idea('Pollo con queso')]),'ideas_recetas',[],['Keto'],[])
  assert.equal(x.validas,1)
  assert.equal(x.descartadas,1)
})
test('no confunde arroz de coliflor con cereal',()=>{
  const x=revisarRespuestaChefRayku(answer([idea('Arroz de coliflor',['200 g arroz de coliflor','queso'])]),'ideas_recetas',[],['Keto'],[])
  assert.equal(x.validas,1)
})
test('no repite nombres guardados o duplicados dentro de la respuesta',()=>{
  const x=revisarRespuestaChefRayku(answer([idea('Pollo asado'),idea('Pollo nuevo'),idea('Pollo nuevo')]),'ideas_recetas',[],[],['Pollo asado'])
  assert.equal(x.validas,1)
  assert.equal(x.descartadas,2)
})
test('rechaza contenido sin recetas estructuradas',()=>{
  assert.throws(()=>revisarRespuestaChefRayku('{mal json','ideas_recetas',[],[],[]))
  assert.throws(()=>revisarRespuestaChefRayku(answer([idea('Pasta',['macarrones'])]),'ideas_recetas',[],['Keto'],[]))
})

test('conserva sustitutos keto de harina y pasta',()=>{
  const x=revisarRespuestaChefRayku(answer([
    idea('Tostada keto',['40 g pan de almendra','huevo']),
    idea('Fideos de konjac',['100 g pasta de konjac','pollo'])
  ]),'ideas_recetas',[],['Keto'],[])
  assert.equal(x.validas,2)
})
