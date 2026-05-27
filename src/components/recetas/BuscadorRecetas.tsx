type Props = {
  busqueda: string
  setBusqueda: (valor: string) => void

  filtros: {
    favoritas: boolean
    keto: boolean
    rapidas: boolean
    economicas: boolean
    airFryer: boolean
  }

  setFiltros: (
    filtros: {
      favoritas: boolean
      keto: boolean
      rapidas: boolean
      economicas: boolean
      airFryer: boolean
    }
  ) => void
}

export default function BuscadorRecetas({
  busqueda,
  setBusqueda,
  filtros,
  setFiltros,
}: Props) {
  function toggleFiltro(
    clave:
      | 'favoritas'
      | 'keto'
      | 'rapidas'
      | 'economicas'
      | 'airFryer'
  ) {
    setFiltros({
      ...filtros,
      [clave]: !filtros[clave],
    })
  }

  return (
    <div
      className="card"
      style={{
        marginBottom: 20,
      }}
    >
      <h3 style={{ marginBottom: 14 }}>
        🔎 Buscar y filtrar
      </h3>

      <input
        type="text"
        placeholder="Busca por receta, ingrediente, dieta, etiqueta..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 16,
        }}
      >
        <button
          type="button"
          className={
            filtros.favoritas
              ? 'btn-primario'
              : 'btn-secundario'
          }
          onClick={() =>
            toggleFiltro('favoritas')
          }
        >
          ❤️ Favoritas
        </button>

        <button
          type="button"
          className={
            filtros.keto
              ? 'btn-primario'
              : 'btn-secundario'
          }
          onClick={() =>
            toggleFiltro('keto')
          }
        >
          🥑 Keto
        </button>

        <button
          type="button"
          className={
            filtros.rapidas
              ? 'btn-primario'
              : 'btn-secundario'
          }
          onClick={() =>
            toggleFiltro('rapidas')
          }
        >
          ⚡ Rápidas
        </button>

        <button
          type="button"
          className={
            filtros.economicas
              ? 'btn-primario'
              : 'btn-secundario'
          }
          onClick={() =>
            toggleFiltro(
              'economicas'
            )
          }
        >
          💸 Económicas
        </button>

        <button
          type="button"
          className={
            filtros.airFryer
              ? 'btn-primario'
              : 'btn-secundario'
          }
          onClick={() =>
            toggleFiltro(
              'airFryer'
            )
          }
        >
          🔥 Air Fryer
        </button>
      </div>
    </div>
  )
}