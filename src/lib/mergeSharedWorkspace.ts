import type { WorkspaceData } from './workspaceData'
import type { WorkspaceKind } from './workspaces'

const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b)

type Identifiable={id:string}
function mergeItems<T extends Identifiable>(
  base:T[], local:T[], remote:T[], key:(item:T)=>string
):T[] {
  const map=(items:T[])=>{
    const result=new Map<string,T>()
    for(const item of items){
      const id=key(item)
      if(!id || result.has(id)) throw new Error('Los datos compartidos contienen identificadores duplicados.')
      result.set(id,item)
    }
    return result
  }
  if(same(local,base)) return remote
  if(same(remote,base)) return local
  const bases=map(base), locals=map(local), remotes=map(remote)
  const keys=new Set([...bases.keys(),...locals.keys(),...remotes.keys()])
  const merged=new Map<string,T>()
  for(const id of keys){
    const old=bases.get(id)
    const mine=locals.get(id)
    const theirs=remotes.get(id)
    const iChanged=!same(mine,old)
    const rChanged=!same(theirs,old)
    if(iChanged && rChanged && !same(mine,theirs)){
      throw new Error('Dos personas han modificado el mismo elemento ('+id+'). Se han conservado tus cambios locales; revisa antes de volver a guardar.')
    }
    const chosen=iChanged ? mine : theirs
    if(chosen!==undefined) merged.set(id,chosen)
  }
  // Retain the newest remote ordering and append new items added only locally.
  const result:T[]=[]
  for(const item of remote) {
    const id=key(item)
    const selected=merged.get(id)
    if(selected){result.push(selected);merged.delete(id)}
  }
  for(const item of local){
    const id=key(item)
    const selected=merged.get(id)
    if(selected){result.push(selected);merged.delete(id)}
  }
  return result
}
function mergeChecks(base:string[],local:string[],remote:string[]):string[]{
  const old=new Set(base),mine=new Set(local),theirs=new Set(remote)
  const all=new Set([...base,...local,...remote])
  const present=new Set<string>()
  for(const id of all){
    const l=mine.has(id),r=theirs.has(id),b=old.has(id)
    if((l!==b?l:r)) present.add(id)
  }
  return [...new Set([...remote,...local])].filter(id=>present.has(id))
}

export function mergeSharedWorkspace<K extends WorkspaceKind>(
  kind:K,base:WorkspaceData[K],local:WorkspaceData[K],remote:WorkspaceData[K]
):WorkspaceData[K] {
  if(kind==='shopping_list'){
    const b=base as WorkspaceData['shopping_list']
    const l=local as WorkspaceData['shopping_list']
    const r=remote as WorkspaceData['shopping_list']
    return {
      compraManual:mergeItems(b.compraManual,l.compraManual,r.compraManual,x=>x.id),
      checksCompra:mergeChecks(b.checksCompra,l.checksCompra,r.checksCompra),
    } as WorkspaceData[K]
  }
  const b=base as Identifiable[],l=local as Identifiable[],r=remote as Identifiable[]
  const key=kind==='planning'
    ? (x:Identifiable)=>{const p=x as Identifiable & {fecha:string;tipoComida:string};return p.fecha+'|'+p.tipoComida}
    : (x:Identifiable)=>x.id
  return mergeItems(b,l,r,key) as WorkspaceData[K]
}
