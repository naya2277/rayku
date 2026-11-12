import { useMemo, useState } from 'react'
import { useRaykuStore } from '../../store'
import { normalizarIngrediente } from '../../lib/generarMenuSemanal'
import type { Receta } from '../../store/types'

type Props = { onAbrirReceta: (id: string) => void }
const ideasPapelArroz = [
  { nombre: 'Rollitos frescos de papel de arroz con salmón y queso crema', ingredientes: ['4 hojas de papel de arroz','150 g de salmón cocinado','80 g de queso crema','50 g de zanahoria rallada','Hojas de lechuga'], pasos: 'Hidrata las hojas de papel de arroz unos segundos siguiendo el envase. Rellena con el salmón ya cocinado, el queso crema, la zanahoria y la lechuga. Dobla los laterales y enrolla. Sirve frío.', tiempo: 20 },
  { nombre: 'Rollitos crujientes de papel de arroz con pollo', ingredientes: ['4 hojas de papel de arroz','200 g de pollo cocinado y desmenuzado','60 g de zanahoria rallada','1 cucharada de aceite de oliva','Especias al gusto'], pasos: 'Humedece brevemente las hojas de papel de arroz. Rellena con pollo completamente cocinado y zanahoria. Cierra bien, pincela con aceite y cocina en freidora de aire a 190 °C unos 8-12 minutos, vigilando hasta que estén crujientes.', tiempo: 25 },
  { nombre: 'Saquitos de papel de arroz con espinacas y queso', ingredientes: ['4 hojas de papel de arroz','120 g de espinacas salteadas y escurridas','100 g de queso crema','40 g de queso rallado','1 cucharadita de aceite de oliva'], pasos: 'Mezcla las espinacas cocinadas y escurridas con los quesos. Hidrata brevemente las hojas de papel de arroz, rellena y cierra en saquitos. Pincela con aceite y cocina en freidora de aire a 185 °C unos 8-12 minutos, comprobando que queden dorados.', tiempo: 25 },
]
function crearReceta(idea: typeof ideasPapelArroz[number]): Receta {
  return { id: crypto.randomUUID(), nombre: idea.nombre, imagen: '', favorita: false,
    ingredientes: idea.ingredientes, ingredientesBase: ['papel de arroz'],
    pasos: idea.pasos, tiposComida: ['comida','cena'], dietas: [],
    caracteristicas: [], tiempo: idea.tiempo, raciones: 2, dificultad: 'Fácil',
    requiereDescongelar: false, valoracion: 0, nota: 'Idea de Chef Rayku. Revisa ingredientes y cantidades antes de cocinar.' }
}
export default function BuscadorIngrediente({onAbrirReceta}: Props) {
  const recetas = useRaykuStore(s=>s.recetas)
  const agregar = useRaykuStore(s=>s.addReceta)
  const [ingrediente,setIngrediente] = useState('')
  const [buscar,setBuscar] = useState('')
  const [guardadas,setGuardadas] = useState<string[]>([])
  const existentes = useMemo(()=>recetas.filter(r=>buscar && [r.nombre,...r.ingredientes,...r.ingredientesBase].some(t=>normalizarIngrediente(t).includes(normalizarIngrediente(buscar)))),[recetas,buscar])
  const ideas = normalizarIngrediente(buscar).includes('papel de arroz') ? ideasPapelArroz : []
  return <section className="card" style={{marginBottom:18,background:'linear-gradient(135deg,#fff0f6,#f6f0ff)'}}>
    <h2>🥬 ¿Qué preparo con un ingrediente?</h2>
    <p>Dime qué quieres aprovechar. Rayku busca primero en tus recetas y, cuando tiene ideas preparadas, también te ofrece recetas nuevas.</p>
    <form onSubmit={e=>{e.preventDefault();setBuscar(ingrediente.trim())}} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <input aria-label="Ingrediente para buscar recetas" placeholder="Por ejemplo: papel de arroz" value={ingrediente} onChange={e=>setIngrediente(e.target.value)} style={{flex:'1 1 220px'}} />
      <button className="btn-principal" disabled={!ingrediente.trim()}>Buscar recetas</button>
    </form>
    {buscar && <div style={{display:'grid',gap:10,marginTop:14}}>
      <h3>Resultados para «{buscar}»</h3>
      {existentes.map(r=><button type="button" className="btn-secundario" key={r.id} onClick={()=>onAbrirReceta(r.id)}>📖 {r.nombre} · Ver receta guardada</button>)}
      {ideas.filter(idea=>!recetas.some(r=>normalizarIngrediente(r.nombre)===normalizarIngrediente(idea.nombre))).map(idea=><article key={idea.nombre} style={{background:'white',padding:12,borderRadius:12}}>
        <strong>✨ {idea.nombre}</strong>
        <p>{idea.tiempo} min · 2 raciones</p>
        <details><summary>Ingredientes y preparación</summary>
          <ul>{idea.ingredientes.map(i=><li key={i}>{i}</li>)}</ul>
          <p>{idea.pasos}</p>
        </details>
        <button type="button" className="btn-secundario" disabled={guardadas.includes(idea.nombre)} onClick={()=>{agregar(crearReceta(idea));setGuardadas(p=>[...p,idea.nombre])}}>
          {guardadas.includes(idea.nombre)?'✓ Guardada en recetas':'💜 Guardar en mis recetas'}
        </button>
      </article>)}
      {!existentes.length && !ideas.length && <p>No he encontrado recetas para este ingrediente en tu biblioteca. Todavía no tengo generación libre de recetas nuevas para cualquier ingrediente; no voy a inventarte resultados.</p>}
    </div>}
  </section>
}
