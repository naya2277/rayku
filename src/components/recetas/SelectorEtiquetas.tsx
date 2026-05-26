type Props = {
  titulo: string
  opciones: string[]
  seleccionadas: string[]
  custom: string
  placeholder: string
  setSeleccionadas: (valores: string[]) => void
  setCustom: (valor: string) => void
}

export default function SelectorEtiquetas({
  titulo,
  opciones,
  seleccionadas,
  custom,
  placeholder,
  setSeleccionadas,
  setCustom,
}: Props) {
  const toggle = (valor: string) => {
    setSeleccionadas(
      seleccionadas.includes(valor)
        ? seleccionadas.filter((x) => x !== valor)
        : [...seleccionadas, valor]
    )
  }

  const agregarCustom = () => {
    const limpio = custom.trim()
    if (!limpio) return

    if (!seleccionadas.includes(limpio)) {
      setSeleccionadas([...seleccionadas, limpio])
    }

    setCustom('')
  }

  return (
    <div>
      <h4 style={{ marginBottom: 10 }}>{titulo}</h4>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        {[...opciones, ...seleccionadas.filter((x) => !opciones.includes(x))].map(
          (opcion) => {
            const activa = seleccionadas.includes(opcion)

            return (
              <button
                key={opcion}
                type="button"
                className="btn-secundario"
                style={{
                  background: activa ? '#fce4ec' : 'white',
                  color: activa ? '#c45b86' : undefined,
                  touchAction: 'manipulation',
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle(opcion)
                }}
              >
                {opcion}
              </button>
            )
          }
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder={placeholder}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />

        <button
          type="button"
          className="btn-secundario"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            agregarCustom()
          }}
        >
          ➕
        </button>
      </div>
    </div>
  )
}