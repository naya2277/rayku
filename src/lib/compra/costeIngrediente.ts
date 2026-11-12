/** Convert compatible price and recipe quantities before estimating cost. */
export function costeIngrediente(
 requerido:number|null,unidadRequerida:string|null,
 precioEnvase:number,cantidadEnvase:number,unidadEnvase:string,
):number|null {
 if(requerido===null || unidadRequerida===null || requerido<0 || precioEnvase<0 ||
    !Number.isFinite(requerido) || !Number.isFinite(precioEnvase) ||
    !Number.isFinite(cantidadEnvase) || cantidadEnvase<=0) return null
 const normal=(x:string)=>x.toLowerCase().trim().replace(/\.$/,'')
 const escala=(x:string):{tipo:string;factor:number}|null=>{
   const n=normal(x)
   if(['g','gramos','gramo'].includes(n))return {tipo:'peso',factor:1}
   if(['kg','kilo','kilos'].includes(n))return {tipo:'peso',factor:1000}
   if(['ml','mililitro','mililitros'].includes(n))return {tipo:'volumen',factor:1}
   if(['l','litro','litros'].includes(n))return {tipo:'volumen',factor:1000}
   if(['u','ud','uds','unidad','unidades'].includes(n))return {tipo:'unidad',factor:1}
   if(['lata','paquete','bote','comida'].includes(n))return {tipo:n,factor:1}
   return null
 }
 const a=escala(unidadRequerida),b=escala(unidadEnvase)
 if(!a || !b || a.tipo!==b.tipo)return null
 return requerido*a.factor/(cantidadEnvase*b.factor)*precioEnvase
}
