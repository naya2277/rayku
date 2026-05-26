import { useEffect, useRef, useState } from 'react'

import {
  useRaykuStore,
  type Dificultad,
  type Receta,
} from '../store'

import FormularioReceta from '../components/recetas/FormularioReceta'
import CardReceta from '../components/recetas/CardReceta'

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

const BORRADOR_KEY =
  'rayku-borrador-receta'

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

  const ultimoGuardadoRef =
    useRef(0)

  const [busqueda, setBusqueda] =
    useState('')

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false)

  const [
    editandoId,
    setEditandoId,
  ] = useState<string | null>(
    null
  )

  const [
    borradorCargado,
    setBorradorCargado,
  ] = useState(false)

  const [mensaje, setMensaje] =
    useState('')

  const [nombre, setNombre] =
    useState('')

  const [imagen, setImagen] =
    useState('')

  const [
    ingredientes,
    setIngredientes,
  ] = useState('')

  const [pasos, setPasos] =
    useState('')

  const [nota, setNota] =
    useState('')

  const [tiempo, setTiempo] =
    useState(0)

  const [raciones, setRaciones] =
    useState(1)

  const [
    dificultad,
    setDificultad,
  ] = useState<Dificultad>(
    'Fácil'
  )

  const [
    requiereDescongelar,
    setRequiereDescongelar,
  ] = useState(false)

  const [
    valoracion,
    setValoracion,
  ] = useState(0)

  const [
    tiposComida,
    setTiposComida,
  ] = useState<string[]>([])

  const [
    ingredientesBase,
    setIngredientesBase,
  ] = useState<string[]>([])

  const [dietas, setDietas] =
    useState<string[]>([])

  const [
    caracteristicas,
    setCaracteristicas,
  ] = useState<string[]>([])

  const [customTipo, setCustomTipo] =
    useState('')

  const [customBase, setCustomBase] =
    useState('')

  const [
    customDieta,
    setCustomDieta,
  ] = useState('')

  const [
    customCaracteristica,
    setCustomCaracteristica,
  ] = useState('')

  useEffect(() => {
    const borrador =
      localStorage.getItem(
        BORRADOR_KEY
      )

    if (!borrador) {
      setBorradorCargado(true)
      return
    }

    try {
      const data =
        JSON.parse(borrador)

      setNombre(data.nombre || '')
      setImagen(data.imagen || '')
      setIngredientes(
        data.ingredientes || ''
      )
      setPasos(data.pasos || '')
      setNota(data.nota || '')
      setTiempo(data.tiempo || 0)
      setRaciones(
        data.raciones || 1
      )

      setDificultad(
        data.dificultad ||
          'Fácil'
      )

      setRequiereDescongelar(
        data.requiereDescongelar ||
          false
      )

      setValoracion(
        data.valoracion || 0
      )

      setTiposComida(
        data.tiposComida || []
      )

      setIngredientesBase(
        data.ingredientesBase ||
          []
      )

      setDietas(data.dietas || [])

      setCaracteristicas(
        data.caracteristicas ||
          []
      )

      if (
        data.nombre ||
        data.ingredientes ||
        data.pasos ||
        data.nota
      ) {
        setMostrarFormulario(true)
      }
    } catch {
      localStorage.removeItem(
        BORRADOR_KEY
      )
    } finally {
      setBorradorCargado(true)
    }
  }, [])

  useEffect(() => {
    if (
      !borradorCargado ||
      editandoId
    )
      return

    const hayAlgo =
      nombre ||
      imagen ||
      ingredientes ||
      pasos ||
      nota ||
      tiposComida.length ||
      ingredientesBase.length ||
      dietas.length ||
      caracteristicas.length

    if (!hayAlgo) return

    localStorage.setItem(
      BORRADOR_KEY,
      JSON.stringify({
        nombre,
        imagen,
        ingredientes,
        pasos,
        nota,
        tiempo,
        raciones,
        dificultad,
        requiereDescongelar,
        valoracion,
        tiposComida,
        ingredientesBase,
        dietas,
        caracteristicas,
      })
    )
  }, [
    borradorCargado,
    editandoId,
    nombre,
    imagen,
    ingredientes,
    pasos,
    nota,
    tiempo,
    raciones,
    dificultad,
    requiereDescongelar,
    valoracion,
    tiposComida,
    ingredientesBase,
    dietas,
    caracteristicas,
  ])

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

      setMostrarFormulario(false)

      limpiarFormulario()

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

  const limpiarFormulario = () => {
    setEditandoId(null)
    setNombre('')
    setImagen('')
    setIngredientes('')
    setPasos('')
    setNota('')
    setTiempo(0)
    setRaciones(1)
    setDificultad('Fácil')

    setRequiereDescongelar(false)

    setValoracion(0)

    setTiposComida([])

    setIngredientesBase([])

    setDietas([])

    setCaracteristicas([])

    setCustomTipo('')
    setCustomBase('')
    setCustomDieta('')
    setCustomCaracteristica('')

    localStorage.removeItem(
      BORRADOR_KEY
    )
  }

  const cargarRecetaEnFormulario =
    (receta: Receta) => {
      setEditandoId(receta.id)

      setNombre(receta.nombre)

      setImagen(receta.imagen)

      setIngredientes(
        receta.ingredientes.join(
          ', '
        )
      )

      setPasos(receta.pasos)

      setNota(receta.nota)

      setTiempo(receta.tiempo)

      setRaciones(
        receta.raciones
      )

      setDificultad(
        receta.dificultad
      )

      setRequiereDescongelar(
        receta.requiereDescongelar
      )

      setValoracion(
        receta.valoracion
      )

      setTiposComida(
        receta.tiposComida
      )

      setIngredientesBase(
        receta.ingredientesBase
      )

      setDietas(receta.dietas)

      setCaracteristicas(
        receta.caracteristicas
      )

      setMostrarFormulario(true)
    }

  const guardarReceta = () => {
    const ahora = Date.now()

    if (
      ahora -
        ultimoGuardadoRef.current <
      600
    ) {
      return
    }

    ultimoGuardadoRef.current =
      ahora

    const nombreLimpio =
      nombre.trim()

    if (!nombreLimpio) {
      setMensaje(
        'Ponle nombre a la receta 💕'
      )

      return
    }

    const datosReceta = {
      nombre: nombreLimpio,

      imagen: imagen.trim(),

      ingredientes: ingredientes
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),

      pasos,

      tiposComida,

      ingredientesBase,

      dietas,

      caracteristicas,

      tiempo,

      raciones,

      dificultad,

      requiereDescongelar,

      valoracion,

      nota,
    }

    try {
      if (editandoId) {
        updateReceta(
          editandoId,
          datosReceta
        )

        setMensaje(
          '✅ Cambios guardados'
        )
      } else {
        addReceta({
          id:
            typeof crypto !==
              'undefined' &&
            crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,

          favorita: false,

          ...datosReceta,
        })

        setMensaje(
          '✅ Receta guardada'
        )
      }

      setBusqueda('')

      limpiarFormulario()

      setMostrarFormulario(false)

      setTimeout(() => {
        setMensaje('')
      }, 2500)
    } catch (error) {
      console.error(
        'Error guardando receta:',
        error
      )

      setMensaje(
        'No se ha podido guardar 💔'
      )
    }
  }

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
            setMostrarFormulario(
              !mostrarFormulario
            )
          }
        >
          ➕ Nueva receta
        </button>
      </div>

      {mensaje && (
        <div
          className="card"
          style={{
            marginBottom: 20,

            color: '#8f7080',

            textAlign: 'center',
          }}
        >
          {mensaje}
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

      {mostrarFormulario && (
        <FormularioReceta
          editandoId={editandoId}
          nombre={nombre}
          setNombre={setNombre}
          imagen={imagen}
          setImagen={setImagen}
          ingredientes={ingredientes}
          setIngredientes={
            setIngredientes
          }
          pasos={pasos}
          setPasos={setPasos}
          nota={nota}
          setNota={setNota}
          tiempo={tiempo}
          setTiempo={setTiempo}
          raciones={raciones}
          setRaciones={setRaciones}
          dificultad={dificultad}
          setDificultad={
            setDificultad
          }
          requiereDescongelar={
            requiereDescongelar
          }
          setRequiereDescongelar={
            setRequiereDescongelar
          }
          valoracion={valoracion}
          setValoracion={
            setValoracion
          }
          tiposComida={
            tiposComida
          }
          setTiposComida={
            setTiposComida
          }
          ingredientesBase={
            ingredientesBase
          }
          setIngredientesBase={
            setIngredientesBase
          }
          dietas={dietas}
          setDietas={setDietas}
          caracteristicas={
            caracteristicas
          }
          setCaracteristicas={
            setCaracteristicas
          }
          customTipo={customTipo}
          setCustomTipo={
            setCustomTipo
          }
          customBase={customBase}
          setCustomBase={
            setCustomBase
          }
          customDieta={
            customDieta
          }
          setCustomDieta={
            setCustomDieta
          }
          customCaracteristica={
            customCaracteristica
          }
          setCustomCaracteristica={
            setCustomCaracteristica
          }
          guardarReceta={
            guardarReceta
          }
          limpiarFormulario={
            limpiarFormulario
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

              color:
                '#9e7d90',
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
              onEditar={
                cargarRecetaEnFormulario
              }
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