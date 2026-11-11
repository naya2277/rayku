import test from 'node:test'
import assert from 'node:assert/strict'
import { costeIngrediente } from '../src/lib/compra/costeIngrediente.ts'
test('convierte un envase de 1 kg para 250 gramos en receta',()=>{
 assert.equal(costeIngrediente(250,'g',4,1,'kg'),1)
})
test('convierte 500 ml frente a envase de 1 litro',()=>{
 assert.equal(costeIngrediente(500,'ml',2.5,1,'l'),1.25)
})
test('no compara cantidades de distinta dimensión',()=>{
 assert.equal(costeIngrediente(100,'g',2,1,'l'),null)
})
test('no inventa precios cuando la cantidad es desconocida',()=>{
 assert.equal(costeIngrediente(null,'g',2,1,'kg'),null)
 assert.equal(costeIngrediente(100,'g',2,0,'kg'),null)
})
