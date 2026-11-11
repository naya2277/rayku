// Pure comparison module: usable by the browser and Node tests without external state.
function claveProducto(nombre:string){
 const sinonimos:Record<string,string>={
  zanahorias:'zanahoria',peras:'pera',patatas:'patata',tomates:'tomate',huevos:'huevo',
  manzanas:'manzana',cebollas:'cebolla',garbanzos:'garbanzo',pimientos:'pimiento',
  berenjenas:'berenjena',champinones:'champinon',esparragos:'esparrago',
  alcachofas:'alcachofa',fresas:'fresa',espinacas:'espinaca',
  lentejas:'lenteja',judias:'judia',almendras:'almendra',naranjas:'naranja'}
 return nombre.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/\([^)]*\)/g,'').replace(/[^a-z0-9 ]/g,' ').trim().split(/\s+/)
  .filter(w=>w&&!['de','del','la','el','los','las','un','una','para','tipo'].includes(w))
  .map(w=>sinonimos[w]??w).join(' ')
}
function costeIngrediente(cantidad:number,unidad:string,precio:number,cantidadEnvase:number,unidadEnvase:string,saleMode:'envase'|'granel'='envase'):number|null{
 if(!Number.isFinite(cantidad)||cantidad<=0||!Number.isFinite(precio)||precio<=0||
  !Number.isFinite(cantidadEnvase)||cantidadEnvase<=0)return null
 const info=(u:string):{tipo:string;factor:number}|null=>{
  const n=u.toLowerCase().trim().replace(/\.$/,'')
  if(['g','gramo','gramos'].includes(n))return {tipo:'peso',factor:1}
  if(['kg','kilo','kilos'].includes(n))return {tipo:'peso',factor:1000}
  if(['ml','mililitro','mililitros'].includes(n))return {tipo:'volumen',factor:1}
  if(['l','litro','litros'].includes(n))return {tipo:'volumen',factor:1000}
  if(['u','ud','uds','unidad','unidades'].includes(n))return {tipo:'unidad',factor:1}
  if(['paquete','lata','bote'].includes(n))return {tipo:n,factor:1}
  return null
 }
 const a=info(unidad),b=info(unidadEnvase)
 if(!a||!b||a.tipo!==b.tipo)return null
 if(saleMode==='granel' && !['peso','volumen'].includes(a.tipo))return null
 // The price entered is the price of a purchasable package, not necessarily
 // the price of the fraction consumed. Avoid reporting impossible checkout totals.
 // Only explicitly loose/by-weight products may be charged proportionally.
 const ratio=cantidad*a.factor/(cantidadEnvase*b.factor)
 return (saleMode==='granel' ? ratio : Math.ceil(ratio-1e-9))*precio
}

export const TIENDAS=['Consum','Mercadona','ALDI','Lidl','Carrefour','Dia','Otro'] as const
export type Tienda=typeof TIENDAS[number]
export type ObjetivoCompra='ahorro'|'equilibrio'|'comodidad'
export type PrecioTienda={store:Tienda;product_key:string;price:number;quantity:number;unit:string;observed_at?:string;sale_mode?:'envase'|'granel'}
export type OfertaSupermercado={
 source:'ALDI'|'Lidl';product_key:string;product_name:string;price:number;
 quantity:number;unit:string;valid_from:string;valid_until:string;
 requires_loyalty:boolean;source_url:string;fetched_at?:string;sale_mode?:'envase'|'granel'
}
export type Necesidad={nombre:string;cantidad:number|null;unidad:string|null}
export type ComparacionItem={producto:string;cantidad:number;unidad:string;
 tienda:Tienda;coste:number;oferta:boolean;requires_loyalty:boolean}
export type Comparacion={
 coste:number;costeAjustado:number;tiendas:Tienda[];items:ComparacionItem[];
 sinPrecio:string[];totalConPrecio:number
}
export function ofertaVigente(o:OfertaSupermercado,fecha:string,permitirFidelizacion:boolean):boolean{
 return fecha>=o.valid_from && fecha<=o.valid_until &&
  (!o.requires_loyalty||permitirFidelizacion) && Number.isFinite(o.price)&&o.price>0&&Number.isFinite(o.quantity)&&o.quantity>0 && o.valid_from<=o.valid_until
}
function costeParaNecesidad(n:Necesidad,precio:{price:number;quantity:number;unit:string;sale_mode?:'envase'|'granel'}):number|null{
 if(n.cantidad===null || !n.unidad)return null
 return costeIngrediente(n.cantidad,n.unidad,precio.price,precio.quantity,precio.unit,precio.sale_mode)
}
export function compararSupermercados(
 necesidades:Necesidad[],precios:PrecioTienda[],ofertas:OfertaSupermercado[],
 tiendasPermitidas:Tienda[],objetivo:ObjetivoCompra,fecha:string,
 permitirFidelizacion:boolean,costeParadaExtra=4
):Comparacion {
 const tiendas=[...new Set(tiendasPermitidas)]
 const candidatos=necesidades.map(n=>{
  const clave=claveProducto(n.nombre)
  const opciones:ComparacionItem[]=[]
  for(const tienda of tiendas){
   const preciosLocales=precios.filter(p=>p.store===tienda&&p.product_key===clave)
   const promociones=ofertas.filter(o=>o.source===tienda&&o.product_key===clave&&ofertaVigente(o,fecha,permitirFidelizacion))
   for(const p of preciosLocales){
    const c=costeParaNecesidad(n,p)
    if(c!==null)opciones.push({producto:n.nombre,cantidad:n.cantidad!,unidad:n.unidad!,
      tienda,coste:c,oferta:false,requires_loyalty:false})
   }
   for(const o of promociones){
    const c=costeParaNecesidad(n,o)
    if(c!==null)opciones.push({producto:n.nombre,cantidad:n.cantidad!,unidad:n.unidad!,
      tienda,coste:c,oferta:true,requires_loyalty:o.requires_loyalty})
   }
  }
  return {n,opciones}
 })
 const sinPrecio=candidatos.filter(x=>!x.opciones.length).map(x=>x.n.nombre)
 const conPrecio=candidatos.filter(x=>x.opciones.length)
 if(!conPrecio.length)return {coste:0,costeAjustado:0,tiendas:[],items:[],sinPrecio,totalConPrecio:0}
 const penalizacion=objetivo==='ahorro'?0:objetivo==='comodidad'?Math.max(15,costeParadaExtra*3):costeParadaExtra
 let mejor:Comparacion|null=null
 for(let mask=1;mask<(1<<tiendas.length);mask++){
  const activas=tiendas.filter((_,i)=>Boolean(mask&(1<<i)))
  const items:ComparacionItem[]=[]
  for(const candidato of conPrecio){
   const mejorProducto=candidato.opciones.filter(x=>activas.includes(x.tienda))
    .sort((a,b)=>a.coste-b.coste)[0]
   if(!mejorProducto)break
   items.push(mejorProducto)
  }
  if(items.length!==conPrecio.length)continue
  const usadas=[...new Set(items.map(i=>i.tienda))]
  const coste=items.reduce((t,i)=>t+i.coste,0)
  const costeAjustado=coste+Math.max(0,usadas.length-1)*penalizacion
  if(!mejor || costeAjustado<mejor.costeAjustado-0.0001 ||
    (Math.abs(costeAjustado-mejor.costeAjustado)<0.0001&&usadas.length<mejor.tiendas.length))
   mejor={coste:Math.round(coste*100)/100,costeAjustado:Math.round(costeAjustado*100)/100,
    tiendas:usadas,items,sinPrecio,totalConPrecio:conPrecio.length}
 }
 return mejor??{coste:0,costeAjustado:0,tiendas:[],items:[],sinPrecio,totalConPrecio:0}
}
