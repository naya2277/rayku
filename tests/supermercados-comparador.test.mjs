import test from 'node:test'
import assert from 'node:assert/strict'
import {compararSupermercados,ofertaVigente} from '../src/lib/comparadorSupermercados.ts'
const producto=[{nombre:'Zanahoria',cantidad:1000,unidad:'g'}]
const precios=[
 {store:'Consum',product_key:'zanahoria',price:1.2,quantity:1,unit:'kg'},
 {store:'ALDI',product_key:'zanahoria',price:1.4,quantity:1,unit:'kg'},
]
test('compara unidades en gramos y kilos',()=>{
 const r=compararSupermercados(producto,precios,[],['Consum','ALDI'],'equilibrio','2026-11-11',false,4)
 assert.equal(r.coste,1.2)
 assert.deepEqual(r.tiendas,['Consum'])
})
test('una oferta oficial válida reemplaza el precio habitual',()=>{
 const ofertas=[{source:'ALDI',product_key:'zanahoria',product_name:'Zanahoria',price:0.89,quantity:1,unit:'kg',valid_from:'2026-11-09',valid_until:'2026-11-15',requires_loyalty:false,source_url:'https://www.aldi.es/ofertas.html'}]
 const r=compararSupermercados(producto,precios,ofertas,['Consum','ALDI'],'equilibrio','2026-11-11',false,4)
 assert.equal(r.coste,0.89)
 assert.deepEqual(r.tiendas,['ALDI'])
})
test('nunca usa oferta vencida',()=>{
 const ofertas=[{source:'ALDI',product_key:'zanahoria',product_name:'Zanahoria',price:0.49,quantity:1,unit:'kg',valid_from:'2026-11-01',valid_until:'2026-11-10',requires_loyalty:false,source_url:'https://www.aldi.es/ofertas.html'}]
 assert.equal(ofertaVigente(ofertas[0],'2026-11-11',false),false)
 const r=compararSupermercados(producto,precios,ofertas,['Consum','ALDI'],'equilibrio','2026-11-11',false,4)
 assert.equal(r.coste,1.2)
})
test('no activa promociones Lidl Plus sin consentimiento',()=>{
 const oferta={source:'Lidl',product_key:'zanahoria',product_name:'Zanahoria',price:0.6,quantity:1,unit:'kg',valid_from:'2026-11-09',valid_until:'2026-11-15',requires_loyalty:true,source_url:'https://www.lidl.es/'}
 assert.equal(ofertaVigente(oferta,'2026-11-11',false),false)
 assert.equal(ofertaVigente(oferta,'2026-11-11',true),true)
})
test('prefiere una compra de una tienda si el ahorro de otra no paga la parada',()=>{
 const necesidades=[{nombre:'Zanahoria',cantidad:1,unidad:'kg'},{nombre:'Pera',cantidad:1,unidad:'kg'}]
 const datos=[
 {store:'Consum',product_key:'zanahoria',price:2,quantity:1,unit:'kg'},
 {store:'Consum',product_key:'pera',price:2,quantity:1,unit:'kg'},
 {store:'ALDI',product_key:'zanahoria',price:1,quantity:1,unit:'kg'},
 {store:'ALDI',product_key:'pera',price:3,quantity:1,unit:'kg'},
 ]
 const r=compararSupermercados(necesidades,datos,[],['Consum','ALDI'],'equilibrio','2026-11-11',false,4)
 assert.equal(r.tiendas.length,1)
 assert.equal(r.coste,4)
 const ahorro=compararSupermercados(necesidades,datos,[],['Consum','ALDI'],'ahorro','2026-11-11',false,4)
 assert.equal(ahorro.coste,3)
 assert.equal(ahorro.tiendas.length,2)
})
test('si falta un producto no presenta el parcial como total',()=>{
 const r=compararSupermercados([...producto,{nombre:'Boniato',cantidad:1000,unidad:'g'}],precios,[],['Consum','ALDI'],'equilibrio','2026-11-11',false,4)
 assert.deepEqual(r.sinPrecio,['Boniato'])
 assert.equal(r.totalConPrecio,1)
})

test('no infravalora un envase cerrado cuando solo se necesita una parte',()=>{
 const necesidades=[{nombre:'Salmón',cantidad:250,unidad:'g'}]
 const datos=[{store:'Consum',product_key:'salmon',price:8,quantity:1,unit:'kg'}]
 const r=compararSupermercados(necesidades,datos,[],['Consum'],'ahorro','2026-11-11',false,4)
 assert.equal(r.coste,8)
})
test('compra suficientes envases completos y mantiene la conversión kg/g',()=>{
 const necesidades=[{nombre:'Salmón',cantidad:1250,unidad:'g'}]
 const datos=[{store:'Consum',product_key:'salmon',price:8,quantity:1,unit:'kg'}]
 const r=compararSupermercados(necesidades,datos,[],['Consum'],'ahorro','2026-11-11',false,4)
 assert.equal(r.coste,16)
})
test('admite un precio a granel solo cuando se identifica expresamente',()=>{
 const necesidades=[{nombre:'Zanahoria',cantidad:250,unidad:'g'}]
 const datos=[{store:'Consum',product_key:'zanahoria',price:2,quantity:1,unit:'kg',sale_mode:'granel'}]
 const r=compararSupermercados(necesidades,datos,[],['Consum'],'ahorro','2026-11-11',false,4)
 assert.equal(r.coste,0.5)
})
test('unidades indivisibles no se cobran proporcionalmente',()=>{
 const necesidades=[{nombre:'Huevos',cantidad:2,unidad:'u'}]
 const datos=[{store:'Consum',product_key:'huevo',price:3,quantity:12,unit:'u'}]
 const r=compararSupermercados(necesidades,datos,[],['Consum'],'ahorro','2026-11-11',false,4)
 assert.equal(r.coste,3)
})

test('nunca considera una promoción de coste cero ni fechas invertidas',()=>{
 const base={source:'ALDI',product_key:'pera',product_name:'Pera',price:0,quantity:1,unit:'kg',valid_from:'2026-11-09',valid_until:'2026-11-15',requires_loyalty:false,source_url:'https://www.aldi.es/ofertas.html'}
 assert.equal(ofertaVigente(base,'2026-11-11',false),false)
 assert.equal(ofertaVigente({...base,price:1,valid_from:'2026-11-16'},'2026-11-11',false),false)
})
test('no cobra a granel unidades que no pueden fraccionarse',()=>{
 const necesidades=[{nombre:'Huevos',cantidad:2,unidad:'u'}]
 const datos=[{store:'Consum',product_key:'huevo',price:3,quantity:12,unit:'u',sale_mode:'granel'}]
 const r=compararSupermercados(necesidades,datos,[],['Consum'],'ahorro','2026-11-11',false,4)
 assert.deepEqual(r.sinPrecio,['Huevos'])
})
test('normaliza plurales de alimentos sin perder la coincidencia',()=>{
 const necesidades=[{nombre:'Champiñones',cantidad:500,unidad:'g'}]
 const datos=[{store:'Consum',product_key:'champinon',price:2.4,quantity:500,unit:'g'}]
 const r=compararSupermercados(necesidades,datos,[],['Consum'],'ahorro','2026-11-11',false,4)
 assert.equal(r.coste,2.4)
})
