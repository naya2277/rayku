import type { Dificultad } from '../../store'

import SelectorEtiquetas from './SelectorEtiquetas'

type Props = {
  editandoId: string | null

  nombre: string
  setNombre: (v: string) => void

  imagen: string
  setImagen: (v: string) => void

  ingredientes: string
  setIngredientes: (v: string) => void

  pasos: string
  setPasos: (v: string) => void

  nota: string
  setNota: (v: string) => void

  tiempo: number
  setTiempo: (v: number) => void

  raciones: number
  setRaciones: (v: number) => void

  dificultad: Dificultad
  setDificultad: (
    v: Dificultad
  ) => void

  requiereDescongelar: boolean
  setRequiereDescongelar: (
    v: boolean
  ) => void

  valoracion: number
  setValoracion: (
    v: number
  ) => void

  tiposComida: string[]
  setTiposComida: (
    v: string[]
  ) => void

  ingredientesBase: string[]
  setIngredientesBase: (
    v: string[]
  ) => void

  dietas: string[]
  setDietas: (
    v: string[]
  ) => void

  caracteristicas: string[]
  setCaracteristicas: (
    v: string[]
  ) => void

  customTipo: string
  setCustomTipo: (
    v: string
  ) => void

  customBase: string
  setCustomBase: (
    v: string
  ) => void

  customDieta: string
  setCustomDieta: (
    v: string
  ) => void

  customCaracteristica: string
  setCustomCaracteristica: (
    v: string
  ) => void

  guardarReceta: () => void
  limpiarFormulario: () => void

  TIPOS_COMIDA: string[]
  INGREDIENTES_BASE: string[]
  DIETAS: string[]
  CARACTERISTICAS: string[]
}

export default function FormularioReceta({
  editandoId,

  nombre,
  setNombre,

  imagen,
  setImagen,

  ingredientes,
  setIngredientes,

  pasos,
  setPasos,

  nota,
  setNota,

  tiempo,
  setTiempo,

  raciones,
  setRaciones,

  dificultad,
  setDificultad,

  requiereDescongelar,
  setRequiereDescongelar,

  valoracion,
  setValoracion,

  tiposComida,
  setTiposComida,

  ingredientesBase,
  setIngredientesBase,

  dietas,
  setDietas,

  caracteristicas,
  setCaracteristicas,

  customTipo,
  setCustomTipo,

  customBase,
  setCustomBase,

  customDieta,
  setCustomDieta,

  customCaracteristica,
  setCustomCaracteristica,

  guardarReceta,
  limpiarFormulario,

  TIPOS_COMIDA,
  INGREDIENTES_BASE,
  DIETAS,
  CARACTERISTICAS,
}: Props) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 20,
      }}
    >
      <h2
        style={{
          marginBottom: 18,
        }}
      >
        {editandoId
          ? '✏️ Editar receta'
          : '✨ Nueva receta'}
      </h2>

      <div
        style={{
          display: 'grid',
          gap: 16,
        }}
      >
        <input
          placeholder="🍽️ Nombre de la receta"
          value={nombre}
          onChange={(e) =>
            setNombre(
              e.target.value
            )
          }
        />

        <input
          placeholder="📸 URL imagen receta"
          value={imagen}
          onChange={(e) =>
            setImagen(
              e.target.value
            )
          }
        />

        <textarea
          placeholder="🥬 Ingredientes separados por coma"
          value={ingredientes}
          onChange={(e) =>
            setIngredientes(
              e.target.value
            )
          }
          rows={3}
        />

        <textarea
          placeholder="👩‍🍳 Preparación / pasos"
          value={pasos}
          onChange={(e) =>
            setPasos(
              e.target.value
            )
          }
          rows={6}
        />

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(160px, 1fr))',

            gap: 12,
          }}
        >
          <input
            type="number"
            min={0}
            placeholder="⏱️ Tiempo"
            value={tiempo || ''}
            onChange={(e) =>
              setTiempo(
                Number(
                  e.target.value
                )
              )
            }
          />

          <input
            type="number"
            min={1}
            placeholder="🍽️ Raciones"
            value={raciones}
            onChange={(e) =>
              setRaciones(
                Number(
                  e.target.value
                )
              )
            }
          />

          <select
            value={dificultad}
            onChange={(e) =>
              setDificultad(
                e.target
                  .value as Dificultad
              )
            }
          >
            <option value="Fácil">
              🌸 Fácil
            </option>

            <option value="Media">
              ✨ Media
            </option>

            <option value="Elaborada">
              👑 Elaborada
            </option>
          </select>
        </div>

        <SelectorEtiquetas
          titulo="🍽️ Tipo de comida"
          opciones={
            TIPOS_COMIDA
          }
          seleccionadas={
            tiposComida
          }
          setSeleccionadas={
            setTiposComida
          }
          custom={customTipo}
          setCustom={
            setCustomTipo
          }
          placeholder="Añadir tipo..."
        />

        <SelectorEtiquetas
          titulo="🥘 Ingrediente principal"
          opciones={
            INGREDIENTES_BASE
          }
          seleccionadas={
            ingredientesBase
          }
          setSeleccionadas={
            setIngredientesBase
          }
          custom={customBase}
          setCustom={
            setCustomBase
          }
          placeholder="Añadir ingrediente..."
        />

        <SelectorEtiquetas
          titulo="🥑 Dieta"
          opciones={DIETAS}
          seleccionadas={
            dietas
          }
          setSeleccionadas={
            setDietas
          }
          custom={customDieta}
          setCustom={
            setCustomDieta
          }
          placeholder="Añadir dieta..."
        />

        <SelectorEtiquetas
          titulo="✨ Características"
          opciones={
            CARACTERISTICAS
          }
          seleccionadas={
            caracteristicas
          }
          setSeleccionadas={
            setCaracteristicas
          }
          custom={
            customCaracteristica
          }
          setCustom={
            setCustomCaracteristica
          }
          placeholder="Añadir característica..."
        />

        <label
          style={{
            display: 'flex',

            alignItems:
              'center',

            gap: 10,

            color: '#8f7080',

            fontWeight: 700,
          }}
        >
          <input
            type="checkbox"
            checked={
              requiereDescongelar
            }
            onChange={(e) =>
              setRequiereDescongelar(
                e.target.checked
              )
            }
            style={{
              width: 'auto',
            }}
          />

          ❄️ Puede requerir
          descongelar
        </label>

        <div>
          <h4>
            ⭐ Valoración
          </h4>

          <div className="estrellas">
            {Array.from(
              { length: 5 },
              (_, i) => (
                <span
                  key={i}
                  className={`estrella ${
                    i <
                    valoracion
                      ? 'on'
                      : ''
                  }`}
                  onClick={() =>
                    setValoracion(
                      i + 1
                    )
                  }
                >
                  ★
                </span>
              )
            )}
          </div>
        </div>

        <textarea
          placeholder="📝 Nota personal"
          value={nota}
          onChange={(e) =>
            setNota(
              e.target.value
            )
          }
          rows={3}
        />

        <div
          style={{
            display: 'flex',

            gap: 10,

            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn-principal"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              guardarReceta()
            }}
          >
            {editandoId
              ? '💾 Guardar cambios'
              : '💕 Guardar receta'}
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={() => {
              limpiarFormulario()
            }}
          >
            🧹 Limpiar borrador
          </button>
        </div>
      </div>
    </div>
  )
}