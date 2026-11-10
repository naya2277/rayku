export type PerfilPersona = { id: string; nombre: string; dietas: string[]; prohibidos: string[]; favoritos: string[]; rechazadas: string[] }
export type PerfilHogar = { configurado: boolean; personas: PerfilPersona[]; aparatos: string[]; priorizarInventario: boolean }
export const PERFIL_KEY = 'rayku-perfil-hogar-v1'
export const APARATOS = ['Freidora de aire','Horno','Microondas','Vitrocerámica','Gas','Inducción','Olla lenta','Robot de cocina','Tostadora','Batidora','Olla a presión']
export const DIETAS = ['Sin dieta específica','Keto','Baja en carbohidratos','Mediterránea','Vegetariana','Vegana','Sin gluten','Sin lactosa']
export const perfilInicial: PerfilHogar = { configurado: false, personas: [{id:'persona-1',nombre:'Persona 1',dietas:[],prohibidos:[],favoritos:[],rechazadas:[]}],aparatos:[],priorizarInventario:true }
export function cargarPerfilHogar(): PerfilHogar {
  try {
    const raw = localStorage.getItem(PERFIL_KEY)
    if (!raw) return perfilInicial
    const parsed = JSON.parse(raw) as Partial<PerfilHogar>
    return { ...perfilInicial, ...parsed, personas: Array.isArray(parsed.personas) && parsed.personas.length ? parsed.personas.map(p => ({id:p.id,nombre:p.nombre,dietas:p.dietas??[],prohibidos:p.prohibidos??[],favoritos:p.favoritos??[],rechazadas:p.rechazadas??[]})) : perfilInicial.personas, aparatos: parsed.aparatos ?? [] }
  } catch { return perfilInicial }
}
export function guardarPerfilHogar(perfil: PerfilHogar) { localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil)); window.dispatchEvent(new Event('rayku-perfil-actualizado')) }
export const listaTexto = (texto: string) => texto.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean)
