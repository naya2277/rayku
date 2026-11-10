import { useEffect, useState } from 'react'
import { listHouseholds, createHousehold, createHouseholdInvitation, acceptHouseholdInvitation, type Household } from '../../lib/workspaces'
import './WorkspaceSwitcher.css'
import HogarCompartido from './HogarCompartido'

type Props = { userId: string }

/**
 * The shared board is live once migrations are applied; legacy pages remain personal.
 * Selecting a household does not switch the legacy planning or shopping data.
 */
export default function WorkspaceSwitcher({ userId }: Props) {
  const [newName,setNewName] = useState('')
  const [inviteEmail,setInviteEmail] = useState('')
  const [inviteToken,setInviteToken] = useState('')
  const [joinToken,setJoinToken] = useState(() => new URLSearchParams(window.location.search).get('invite') ?? '')
  const [message,setMessage] = useState('')
  const [households, setHouseholds] = useState<Household[]>([])
  const [selection, setSelection] = useState('personal')
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')

  useEffect(() => {
    let active = true
    setSelection('personal')
    setHouseholds([])
    setStatus('loading')
    listHouseholds()
      .then(items => {
        if (!active) return
        setHouseholds(items)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('unavailable')
      })
    return () => { active = false }
  }, [userId])

  const refresh = async () => { const items=await listHouseholds();setHouseholds(items);setStatus('ready') }
  const create = async () => {try {const h=await createHousehold(newName);await refresh();setSelection(h.id);setNewName('');setMessage('Hogar creado. Ya puedes usar el tablero compartido; el planning personal sigue separado.')}catch(e){setMessage(String(e))}}
  const invite = async () => {try {const token=await createHouseholdInvitation(selection,inviteEmail);setInviteToken(token);setMessage('Invitación creada. Comparte el enlace solo con su destinatario.')}catch(e){setMessage(String(e))}}
  const join = async () => {try {await acceptHouseholdInvitation(joinToken.includes('?invite=') ? new URL(joinToken).searchParams.get('invite') ?? '' : joinToken);await refresh();setJoinToken('');setMessage('Invitación aceptada. Selecciona el hogar para abrir el tablero compartido.')}catch(e){setMessage(String(e))}}
  const invitationUrl = inviteToken ? window.location.origin + '/?invite=' + encodeURIComponent(inviteToken) : ''
  return (
    <section className="workspace-switcher" aria-label="Espacios de Rayku">
      <label htmlFor="rayku-workspace">💜 Mi espacio</label>
      <select
        id="rayku-workspace"
        value={selection}
        onChange={event => setSelection(event.target.value)}
        disabled={status !== 'ready'}
      >
        <option value="personal">👤 Mi espacio</option>
        {households.map(household => (
          <option key={household.id} value={household.id}>
            🏡 {household.name}
          </option>
        ))}
      </select>
      <p className="workspace-switcher-note" role="status">
        {status === 'loading'
          ? 'Buscando hogares…'
          : status === 'unavailable'
            ? 'Espacios compartidos pendientes de activar en Supabase.'
            : selection === 'personal'
              ? 'Tus recetas, planning y compra inteligente siguen siendo personales.'
              : 'El tablero del hogar se comparte; el planning y la compra inteligente siguen siendo personales.'}
      </p>
      <details>
        <summary>🏡 Crear hogar o invitar a alguien</summary>
        <div style={{display:'grid',gap:8,marginTop:12}}>
          <label>Nombre del hogar<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nuestra casa"/></label>
          <button type="button" className="btn-secundario" disabled={!newName.trim() || status!=='ready'} onClick={create}>Crear hogar</button>
          {selection !== 'personal' && households.find(h=>h.id===selection)?.created_by===userId && <>
            <label>Correo de la persona invitada<input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="correo@ejemplo.com"/></label>
            <button type="button" className="btn-secundario" disabled={!inviteEmail.includes('@')} onClick={invite}>Generar invitación</button>
            {inviteToken && <><input readOnly aria-label="Enlace de invitación" value={invitationUrl}/><button type="button" className="btn-secundario" onClick={()=>navigator.clipboard.writeText(invitationUrl)}>Copiar enlace</button></>}
          </>}
          <label>Aceptar invitación recibida<input value={joinToken} onChange={e=>setJoinToken(e.target.value)} placeholder="Código de invitación"/></label>
          <button type="button" className="btn-secundario" disabled={!joinToken.trim()} onClick={join}>Unirme al hogar</button>
          {message && <p role="status">{message}</p>}
        </div>
      </details>
      {selection !== 'personal' && households.some(h=>h.id===selection) && <HogarCompartido key={selection} householdId={selection}/>}
    </section>
  )
}
