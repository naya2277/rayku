import type {ItemInventario,UbicacionInventario} from '../store/types'
export type PreparacionLote={recetaNombre:string;raciones:number;ubicacion:Exclude<UbicacionInventario,'pendiente'>;fechaPreparacion:string;fechaCaducidad:string|null;fechaDescongelar:string|null}
export function validarPreparacionLote(lote:PreparacionLote):string|null{
 if(!lote.recetaNombre.trim())return 'Selecciona una receta guardada.'
 if(!Number.isFinite(lote.raciones)||lote.raciones<=0)return 'Indica cuántas raciones has preparado.'
 if(!/^\d{4}-\d{2}-\d{2}$/.test(lote.fechaPreparacion))return 'Indica fecha de preparación.'
 if(lote.fechaCaducidad && lote.fechaCaducidad<lote.fechaPreparacion)return 'La caducidad no puede ser anterior a la preparación.'
 if(lote.fechaDescongelar && lote.ubicacion!=='congelador')return 'La fecha para descongelar requiere que el lote esté congelado.'
 return null
}
export function crearLoteCocinado(lote:PreparacionLote,id:string):ItemInventario{
 const error=validarPreparacionLote(lote)
 if(error)throw new Error(error)
 return {
  id,nombre:'Preparación: '+lote.recetaNombre,cantidad:lote.raciones,unidad:'comida',
  categoria:'otros',ubicacion:lote.ubicacion,fechaPreparacion:lote.fechaPreparacion,
  fechaCaducidad:lote.fechaCaducidad,esCocinado:true,
  fechaDescongelar:lote.fechaDescongelar,necesitaDescongelar:lote.ubicacion==='congelador',
  avisarStockBajo:false,
 }
}
