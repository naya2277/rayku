import type { ItemInventario } from '../../store/types'

/**
 * Only combine genuinely equivalent batches. Different expiry dates, preparation
 * states or locations are retained as separate lots.
 * Quantities must have already passed through normalizarInventario.
 */
export function combinarEntradaInventario(
 inventario:ItemInventario[], nuevo:ItemInventario
): ItemInventario[] {
 const normal=(texto:string)=>texto.toLocaleLowerCase('es').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()
 const index=inventario.findIndex(item=>
  item.ubicacion!=='pendiente' && nuevo.ubicacion!=='pendiente' &&
  normal(item.nombre)===normal(nuevo.nombre) &&
  item.unidad===nuevo.unidad &&
  item.ubicacion===nuevo.ubicacion &&
  (item.fechaCaducidad??null)===(nuevo.fechaCaducidad??null) &&
  Boolean(item.esCocinado)===Boolean(nuevo.esCocinado) &&
  (item.fechaPreparacion??null)===(nuevo.fechaPreparacion??null) &&
  Boolean(item.necesitaDescongelar)===Boolean(nuevo.necesitaDescongelar)
 )
 if(index<0) return [...inventario,nuevo]
 return inventario.map((item,i)=>i===index
   ? {...item,cantidad:Math.round((item.cantidad+nuevo.cantidad)*1000)/1000}
   : item)
}
