import { useState } from 'react'
import { useRaykuStore } from '../../store'
import type { ItemPlanning, Receta } from '../../store/types'
import { recetaCompatible, recetaPermitida, recetaCompatibleHogar } from '../../lib/generarMenuSemanal'
import { cargarPerfilHogar } from '../../lib/perfilHogar'

export default function SustituirPlato({item}: {item: ItemPlanning}) {
  const recetas = useRaykuStore(s=>s.recetas)
  const preferencias = useRaykuStore(s=>s.preferenciasAlimentarias)
  const guardar = useRaykuStore(s=>s.guardarHuecoPlanning)
  const [open,setOpen] = useState(false)
  const [manual,setManual] = useState('')
  const [chosen,setChosen] = useState('')
  const compatibles = recetas.filter(r=>recetaCompatible(r,item.tipoComida) && recetaPermitida(r,preferencias) && recetaCompatibleHogar(r,cargarPerfilHogar()))
  const aplicar = (receta?: Receta) => {
    guardar({...item, recetaId:receta?.id??null, recetaIds:receta?[receta.id]:[], comidaLibre:receta?'':manual.trim(), cocinado:false})
    setOpen(false)
    setManual('')
  }
  const otra = () => {
    const distintas = compatibles.filter(r=>!item.recetaIds.includes(r.id) && r.id!==item.recetaId)
    if (!distintas.length) return
    aplicar(distintas[Math.floor(Math.random()*distintas.length)])
  }
  return <div style={{marginTop:8}}>
    <button type="button" className="btn-secundario" onClick={()=>setOpen(v=>!v)}>🔄 Cambiar plato</button>
    {open && <div style={{display:'grid',gap:8,marginTop:8}}>
      <button type="button" className="btn-secundario" disabled={!compatibles.some(r=>r.id!==item.recetaId && !item.recetaIds.includes(r.id))} onClick={otra}>✨ Otra sugerencia compatible</button>
      <label>Elegir receta existente
        <select value={chosen} onChange={e=>setChosen(e.target.value)}>
          <option value="">Selecciona receta</option>
          {compatibles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
      </label>
      <button type="button" className="btn-secundario" disabled={!chosen} onClick={()=>aplicar(compatibles.find(r=>r.id===chosen))}>Usar esta receta</button>
      <label>Añadir plato manualmente
        <input value={manual} onChange={e=>setManual(e.target.value)} placeholder="Ej. empanada de carne"/>
      </label>
      <button type="button" className="btn-secundario" disabled={!manual.trim()} onClick={()=>aplicar()}>Guardar plato manual</button>
    </div>}
  </div>
}
