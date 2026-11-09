import { useEffect, useState } from 'react'
import { listHouseholds, type Household } from '../../lib/workspaces'
import './WorkspaceSwitcher.css'

type Props = { userId: string }

/**
 * Read-only workspace preview. Existing pages still use the legacy store.
 * Never imply that selecting a household switches the data source yet.
 */
export default function WorkspaceSwitcher({ userId }: Props) {
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
              ? 'Vista previa: tus pantallas aún usan los datos actuales.'
              : 'Vista previa: el hogar está seleccionado, pero sus datos todavía no están conectados.'}
      </p>
    </section>
  )
}
