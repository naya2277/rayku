/**
 * Post-generation checks for Chef Rayku. This is not a medical allergen detector:
 * labels, cross-contact and hidden ingredients still need human verification.
 */
function normalize(value: string): string {
  return value.toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
type Idea = { nombre?: string; ingredientes?: string[]; pasos?: string; origen?: string; dietas?: string[] }
type Respuesta = { ideas?: Idea[]; [key: string]: unknown }
const containsTerm = (haystack: string, needle: string): boolean => {
  const key=normalize(needle)
  if(key.length<3) return false
  return (' '+normalize(haystack)+' ').includes(' '+key+' ') ||
    normalize(haystack).split(' ').some(word => word===key+'s' || (key.endsWith('s') && word===key.slice(0,-1)))
}
const KETO_EXCLUSIONES=['arroz','pasta','macarrones','espaguetis','patata','patatas','boniato','boniatos','harina de trigo','pan','azucar','miel','maiz','cuscus','orzo','lentejas','garbanzos','alubias']

const esSustitutoKeto=(ingrediente:string,excluido:string):boolean=>{
  const t=normalize(ingrediente)
  if(excluido==='arroz' && t.includes('coliflor')) return true
  if(['pasta','macarrones','espaguetis','orzo'].includes(excluido) && (t.includes('konjac') || t.includes('calabacin'))) return true
  if(excluido==='pan' && (t.includes('keto') || t.includes('almendra') || t.includes('linaza') || t.includes('lino') || t.includes('pan nube'))) return true
  return false
}

export function revisarRespuestaChefRayku(
  raw: string,
  mode: string,
  exclusions: string[],
  dietas: string[],
  recetasGuardadas: string[],
): {respuesta: string; descartadas: number; validas: number} {
  let parsed: Respuesta
  try { parsed = JSON.parse(raw) as Respuesta } catch { throw new Error('Chef Rayku devolvió un formato incompleto. Genera nuevas propuestas.') }
  if(!Array.isArray(parsed.ideas)) throw new Error('Chef Rayku no devolvió recetas válidas. Inténtalo de nuevo.')
  const keto = dietas.some(d => normalize(d).includes('keto')) || (mode==='menu_dieta' && dietas.length===0)
  const names=new Set(recetasGuardadas.map(normalize))
  const existing=new Set<string>()
  const before=parsed.ideas.length
  parsed.ideas=parsed.ideas.filter(idea=>{
    if(!idea || typeof idea.nombre!=='string' || !Array.isArray(idea.ingredientes) ||
      !idea.ingredientes.length || !idea.ingredientes.every(x=>typeof x==='string') ||
      typeof idea.pasos!=='string' || !idea.pasos.trim()) return false
    const name=normalize(idea.nombre)
    if(!name || existing.has(name)) return false
    if((mode==='ideas_recetas'||mode==='menu_dieta') && names.has(name)) return false
    if((mode==='ideas_recetas'||mode==='menu_dieta') && idea.origen==='guardada') return false
    const texts=[idea.nombre,...idea.ingredientes]
    if(exclusions.some(ex=>texts.some(t=>containsTerm(t,ex)))) return false
    if(keto && (mode==='ideas_recetas'||mode==='menu_dieta') &&
      KETO_EXCLUSIONES.some(ex=>idea.ingredientes?.some(t=>containsTerm(t,ex) && !esSustitutoKeto(t,ex)))) return false
    existing.add(name)
    return true
  })
  if(parsed.ideas.length===0) throw new Error('Las propuestas no respetaban tus preferencias o estaban repetidas. Vuelve a generar recetas.')
  return {respuesta:JSON.stringify(parsed),descartadas:before-parsed.ideas.length,validas:parsed.ideas.length}
}
