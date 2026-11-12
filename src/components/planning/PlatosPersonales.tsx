import { useState } from 'react'
import { useRaykuStore } from '../../store'
import type { ItemPlanning } from '../../store/types'

type Props = { item: ItemPlanning }
export default function PlatosPersonales({ item }: Props) {
  const recetas = useRaykuStore(s => s.recetas)
  const guardar = useRaykuStore(s => s.guardarHuecoPlanning)
  const [persona, setPersona] = useState('')
  const [plato, setPlato] = useState('')
  const [recetaId, setRecetaId] = useState('')
  const asignaciones = item.platosPorPersona ?? {}
  function add() {
    const nombre = persona.trim()
    if (!nombre || (!plato.trim() && !recetaId)) return
    guardar({
      ...item,
      platosPorPersona: {
        ...asignaciones,
        [nombre]: { recetaId: recetaId || null, comidaLibre: recetaId ? '' : plato.trim() },
      },
    })
    setPlato('')
    setRecetaId('')
  }
  function remove(nombre: string) {
    const nuevos = { ...asignaciones }
    delete nuevos[nombre]
    guardar({ ...item, platosPorPersona: nuevos })
  }
  return <details style={{marginTop:10}}>
    <summary style={{cursor:'pointer'}}>👥 Platos por persona {Object.keys(asignaciones).length ? '(' + Object.keys(asignaciones).length + ')' : ''}</summary>
    <div style={{display:'grid',gap:8,marginTop:10}}>
      {Object.entries(asignaciones).map(([nombre, platoAsignado]) =>
        <div key={nombre} style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <strong>{nombre}:</strong>
          <span>{platoAsignado.recetaId ? recetas.find(r=>r.id===platoAsignado.recetaId)?.nombre ?? 'Receta no disponible' : platoAsignado.comidaLibre}</span>
          <button type="button" className="btn-secundario" onClick={()=>remove(nombre)}>Quitar</button>
        </div>
      )}
      <label>¿Para quién?
        <input value={persona} onChange={e=>setPersona(e.target.value)} placeholder="Carles" />
      </label>
      <label>Receta del hogar (opcional)
        <select value={recetaId} onChange={e=>setRecetaId(e.target.value)}>
          <option value="">Plato escrito manualmente</option>
          {recetas.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
      </label>
      {!recetaId && <label>Plato alternativo
        <input value={plato} onChange={e=>setPlato(e.target.value)} placeholder="Empanada de carne" />
      </label>}
      <button type="button" className="btn-secundario" disabled={!persona.trim() || (!recetaId && !plato.trim())} onClick={add}>Añadir plato individual</button>
    </div>
  </details>
}
