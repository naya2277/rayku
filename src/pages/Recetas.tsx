import { useEffect, useState } from 'react'

import {
  useRaykuStore,
  type Receta,
} from '../store'

import FormularioReceta from '../components/recetas/FormularioReceta'
import CardReceta from '../components/recetas/CardReceta'

import { useFormularioReceta } from '../hooks/useFormularioReceta'

const TIPOS_COMIDA = [
  '☀️ Comida',
  '🌙 Cena',
  '🍳 Desayuno',
  '🍰 Postre',
  '🍿 Snack',
  '🥗 Entrante',
  '🍱 Meal prep',
]

const INGREDIENTES_BASE = [
  '🐔 Pollo',
  '🥩 Ternera',
  '🐷 Cerdo',
  '🐟 Pescado',
  '🦐 Marisco',
  '🥚 Huevos',
  '🧀 Queso',
  '🍝 Pasta',
  '🍚 Arroz',
  '🥔 Patata',
  '🫘 Legumbres',
  '🍎 Fruta',
  '🥬 Verduras',
  '🌱 Vegano',
]

const DIETAS = [
  '🥑 Keto',
  '🔥 Antiinflamatoria',
  '🌾 Mediterránea',
  '💪 Alta proteína',
  '🍬 Baja en azúcar',
  '🥬 Vegetariana',
  '🌱 Vegana',
  '🚫 Sin gluten',
  '🥛 Sin lactosa',
]

const CARACTERISTICAS = [
  '⚡ Rápida',
  '💸 Económica',
  '❄️ Congelable',
  '🍱 Batch cooking',
  '💖 Comfort food',
  '🎉 Invitados',
  '🔥 Air fryer',
  '🧺 Aprovechar sobras',
]

type Props = {
  recetaSeleccionadaId?:
    | string
    | null

  onRecetaSeleccionadaLeida?: () => void
}

export default function Recetas({
  recetaSeleccionadaId,
  onRecetaSeleccionadaLeida,
}: Props) {
  const {
    recetas,
    addReceta,
    updateReceta,
    deleteReceta,
    toggleFavorita,
    duplicarReceta,
  } = useRaykuStore()

  const [busqueda, setBusqueda] =
    useState('')

  const formulario =
    useFormularioReceta({
      addReceta,
      updateReceta,
      setBusqueda,
    })

  useEffect(() => {
    if (!recetaSeleccionadaId)
      return

    const receta = recetas.find(
      (r) =>
        r.id ===
        recetaSeleccionadaId
    )

    if (receta) {
      setBusqueda(receta.nombre)

      formulario.setMostrarFormulario(
        false
      )

      formulario.limpiarFormulario()

      onRecetaSeleccionadaLeida?.()

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }, 100)
    }
  }, [
    recetaSeleccionadaId,
    recetas,
    onRecetaSeleccionadaLeida,
  ])

  const recetasFiltradas =
    recetas.filter((r) => {
      const texto = [
        r.nombre,
        r.ingredientes.join(' '),
        r.pasos,
        r.nota,
        r.tiposComida.join(' '),
        r.ingredientesBase.join(
          ' '
        ),
        r.dietas.join(' '),
        r.caracteristicas.join(
          ' '
        ),
      ]
        .join(' ')
        .toLowerCase()

      return texto.includes(
        busqueda.toLowerCase()
      )
    })

  const editarReceta = (
    receta: Receta
  ) => {
    formulario.cargarRecetaEnFormulario(
      receta
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1>
            📖 Mis recetas
          </h1>

          <p
            style={{
              color: '#9e7d90',
            }}
          >
            Tu colección cute
            de comidas favoritas
            💕
          </p>
        </div>

        <button
          type="button"
          className="btn-principal"
          onClick={() =>
            formulario.setMostrarFormulario(
              !formulario.mostrarFormulario
            )
          }
        >
          ➕ Nueva receta
        </button>
      </div>

      {formulario.mensaje && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            color: '#8f7080',
            textAlign: 'center',
          }}
        >
          {formulario.mensaje}
        </div>
      )}

      <div
        className="card"
        style={{
          marginBottom: 20,
          background:
            'linear-gradient(135deg, #ffe4ec 0%, #f6e9ff 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                marginBottom: 8,
              }}
            >
              ✨ Chef Rayku IA
            </h2>

            <p
              style={{
                color: '#8f7080',
              }}
            >
              Dime ingredientes o
              qué te apetece y
              Rayku te ayudará 💕
            </p>
          </div>

          <button
            type="button"
            className="btn-principal"
          >
            🪄 Generar receta
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 20,
        }}
      >
        <h3
          style={{
            marginBottom: 14,
          }}
        >
          🔎 Buscar y filtrar
        </h3>

        <input
          type="text"
          placeholder="Busca por receta, ingrediente, dieta, etiqueta..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
        />
      </div>

      {formulario.mostrarFormulario && (
        <FormularioReceta
          editandoId={
            formulario.editandoId
          }
          nombre={formulario.nombre}
          setNombre={
            formulario.setNombre
          }
          imagen={formulario.imagen}
          setImagen={
            formulario.setImagen
          }
          ingredientes={
            formulario.ingredientes
          }
          setIngredientes={
            formulario.setIngredientes
          }
          pasos={formulario.pasos}
          setPasos={
            formulario.setPasos
          }
          nota={formulario.nota}
          setNota={formulario.setNota}
          tiempo={formulario.tiempo}
          setTiempo={
            formulario.setTiempo
          }
          raciones={
            formulario.raciones
          }
          setRaciones={
            formulario.setRaciones
          }
          dificultad={
            formulario.dificultad
          }
          setDificultad={
            formulario.setDificultad
          }
          requiereDescongelar={
            formulario.requiereDescongelar
          }
          setRequiereDescongelar={
            formulario.setRequiereDescongelar
          }
          valoracion={
            formulario.valoracion
          }
          setValoracion={
            formulario.setValoracion
          }
          tiposComida={
            formulario.tiposComida
          }
          setTiposComida={
            formulario.setTiposComida
          }
          ingredientesBase={
            formulario.ingredientesBase
          }
          setIngredientesBase={
            formulario.setIngredientesBase
          }
          dietas={formulario.dietas}
          setDietas={
            formulario.setDietas
          }
          caracteristicas={
            formulario.caracteristicas
          }
          setCaracteristicas={
            formulario.setCaracteristicas
          }
          customTipo={
            formulario.customTipo
          }
          setCustomTipo={
            formulario.setCustomTipo
          }
          customBase={
            formulario.customBase
          }
          setCustomBase={
            formulario.setCustomBase
          }
          customDieta={
            formulario.customDieta
          }
          setCustomDieta={
            formulario.setCustomDieta
          }
          customCaracteristica={
            formulario.customCaracteristica
          }
          setCustomCaracteristica={
            formulario.setCustomCaracteristica
          }
          guardarReceta={
            formulario.guardarReceta
          }
          limpiarFormulario={
            formulario.limpiarFormulario
          }
          TIPOS_COMIDA={
            TIPOS_COMIDA
          }
          INGREDIENTES_BASE={
            INGREDIENTES_BASE
          }
          DIETAS={DIETAS}
          CARACTERISTICAS={
            CARACTERISTICAS
          }
        />
      )}

      <div
        style={{
          display: 'grid',
          gap: 16,
        }}
      >
        {recetasFiltradas.length ===
          0 && (
          <div
            className="card"
            style={{
              textAlign:
                'center',
              color: '#9e7d90',
            }}
          >
            Todavía no hay
            recetas 💕
          </div>
        )}

        {recetasFiltradas.map(
          (receta) => (
            <CardReceta
              key={receta.id}
              receta={receta}
              onEditar={editarReceta}
              onEliminar={
                deleteReceta
              }
              onToggleFavorita={
                toggleFavorita
              }
              onDuplicar={
                duplicarReceta
              }
            />
          )
        )}
      </div>
    </div>
  )
}