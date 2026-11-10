import { useState } from 'react'
import type { ItemInventario } from '../../store'
import { parsearIngredienteConCantidad } from '../../lib/cantidadesIngredientes'
import { detectarCategoriaIngrediente } from '../../lib/ingredientes'
import type { UbicacionInventario } from '../../lib/inventario'

type Props = { agregar: (item: ItemInventario) => void }
export default function EntradaRapida({ agregar }: Props) {
 const [texto,setTexto] = useState('')
 const [ubicacion,setUbicacion] = useState<UbicacionInventario>('nevera')
 const [mensaje,setMensaje] = useState('')
 const lineas = texto.split(/[\n;]+/).map(x=>x.trim()).filter(Boolean)
 const guardar = () => {
  let guardados = 0
  for (const linea of lineas) {
   const parsed = parsearIngredienteConCantidad(linea)
   if (!parsed.nombre) continue
   agregar({id:crypto.randomUUID(),nombre:parsed.nombre,cantidad:parsed.cantidad ?? 1,unidad:parsed.unidad ?? 'comida',categoria:detectarCategoriaIngrediente(parsed.nombre),ubicacion,fechaCaducidad:null,necesitaDescongelar:ubicacion==='congelador'})
   guardados++
  }
  setTexto('')
  setMensaje(`${guardados} productos añadidos. Puedes completar caducidades después.`)
 }
 return <section className="card" style={{marginBottom:18,display:'grid',gap:10}}>
  <h3>⚡ Añadir varios productos</h3>
  <p>Escribe un producto por línea. Ejemplos: 1 kg pechuga de pollo, 6 u huevos, 500 g zanahoria. Si no sabes la cantidad, escribe solo el nombre.</p>
  <textarea rows={5} value={texto} onChange={e=>setTexto(e.target.value)} placeholder={'1 kg pechuga de pollo\n6 u huevos\n500 g zanahoria\nQueso rallado'} />
  <label>¿Dónde están?<select value={ubicacion} onChange={e=>setUbicacion(e.target.value as UbicacionInventario)}><option value="nevera">Nevera</option><option value="congelador">Congelador</option><option value="despensa">Despensa</option></select></label>
  <button className="btn-principal" type="button" disabled={!lineas.length} onClick={guardar}>Guardar {lineas.length} productos</button>
  {mensaje && <p role="status">{mensaje}</p>}
 </section>
}
