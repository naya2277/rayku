import {
  useState,
} from 'react'

import {
  useRaykuStore,
} from '../../store'

import {
  consultarChefRayku,
} from '../../lib/chef-rayku/chefRayku'

import type {
  TipoConsultaChefRayku,
} from '../../lib/chef-rayku/tipos'

import ChefRaykuRespuesta from './ChefRaykuRespuesta'

const ACCIONES: {
  tipo: TipoConsultaChefRayku
  titulo: string
  descripcion: string
}[] = [
  {
    tipo: 'ideas_recetas',
    titulo: '🍳 Dame ideas de recetas',
    descripcion:
      'Ideas ricas aunque falte algún ingrediente.',
  },
  {
    tipo: 'cocinar_inventario',
    titulo: '📦 Cocina con lo que tengo',
    descripcion:
      'Usa inventario real y prioriza caducidades.',
  },
  {
    tipo: 'menu_dieta',
    titulo: '🥑 Menú según mi dieta',
    descripcion:
      'Menú keto o bajo en carbohidratos adaptado a ti.',
  },
]

function ListaPreferencias({
  titulo,
  emoji,
  items,
  placeholder,
  valor,
  onChange,
  onAgregar,
  onEliminar,
  color,
}: {
  titulo: string
  emoji: string
  items: string[]
  placeholder: string
  valor: string
  onChange: (valor: string) => void
  onAgregar: () => void
  onEliminar: (valor: string) => void
  color: string
}) {
  return (
    <div
      style={{
        background:
          'rgba(255,255,255,0.72)',
        border:
          '1.5px solid #f5dde8',
        borderRadius: 18,
        padding: 14,
      }}
    >
      <h3
        style={{
          color,
          fontSize: 16,
          marginBottom: 10,
          fontFamily:
            "'Comic Sans MS', 'Trebuchet MS', cursive",
        }}
      >
        {emoji} {titulo}
      </h3>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <input
          value={valor}
          onChange={(e) =>
            onChange(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAgregar()
            }
          }}
          placeholder={placeholder}
          style={{
            flex: '1 1 160px',
            border:
              '1.5px solid var(--borde)',
            borderRadius: 999,
            padding: '9px 12px',
            fontWeight: 800,
            color: '#70465b',
            background: '#fffafc',
          }}
        />

        <button
          type="button"
          className="btn-secundario"
          onClick={onAgregar}
        >
          ➕ Añadir
        </button>
      </div>

      {items.length === 0 ? (
        <p
          style={{
            color: 'var(--txt2)',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Todavía no hay ingredientes en esta lista.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {items.map((item) => (
            <span
              key={item}
              className="pill pill-rosa"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              {item}

              <button
                type="button"
                onClick={() =>
                  onEliminar(item)
                }
                aria-label={`Eliminar ${item}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#c45b86',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: 14,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChefRaykuCard() {
  const {
    recetas,
    inventario,
    planning,
    historialCocinado,
    preferenciasAlimentarias,
    agregarIngredienteProhibido,
    eliminarIngredienteProhibido,
    agregarIngredienteFavorito,
    eliminarIngredienteFavorito,
    addReceta,
  } = useRaykuStore()

  const [
    nuevoProhibido,
    setNuevoProhibido,
  ] = useState('')

  const [
    nuevoFavorito,
    setNuevoFavorito,
  ] = useState('')

  const [
    respuesta,
    setRespuesta,
  ] = useState('')

  const [
    guardadas,
    setGuardadas,
  ] = useState<string[]>([])

  const [
    cargando,
    setCargando,
  ] = useState<
    TipoConsultaChefRayku | null
  >(null)

  const [
    error,
    setError,
  ] = useState('')

  const agregarProhibido = () => {
    agregarIngredienteProhibido(
      nuevoProhibido
    )
    setNuevoProhibido('')
  }

  const agregarFavorito = () => {
    agregarIngredienteFavorito(
      nuevoFavorito
    )
    setNuevoFavorito('')
  }

  const consultar = async (
    tipo: TipoConsultaChefRayku
  ) => {
    setCargando(tipo)
    setError('')
    setRespuesta('')
    setGuardadas([])

    try {
      const texto =
        await consultarChefRayku(
          tipo,
          {
            recetas,
            inventario,
            planning,
            historialCocinado,
            preferenciasAlimentarias,
          }
        )

      setRespuesta(texto)
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Chef Rayku no ha podido responder ahora mismo 💕'
      )
    } finally {
      setCargando(null)
    }
  }

  const guardarRecetaIA = (
    idea: {
      nombre?: string
      ingredientes?: string[]
      pasos?: string
      raciones?: number
      tiempo?: number
      dificultad?: string
      dietas?: string[]
      caracteristicas?: string[]
      consejo?: string
    }
  ) => {
    if (!idea.nombre) {
      return
    }

    addReceta({
      id: '',
      nombre: idea.nombre,
      imagen: '',
      favorita: false,
      ingredientes:
        Array.isArray(
          idea.ingredientes
        )
          ? idea.ingredientes
          : [],
      pasos:
        idea.pasos ||
        idea.consejo ||
        'Receta generada por Chef Rayku.',
      tiposComida: [
        'comida',
        'cena',
      ],
      ingredientesBase: [],
      dietas:
        Array.isArray(idea.dietas)
          ? idea.dietas
          : ['keto'],
      caracteristicas:
        Array.isArray(
          idea.caracteristicas
        )
          ? idea.caracteristicas
          : ['Chef Rayku'],
      tiempo:
        Number(idea.tiempo) ||
        20,
      raciones:
        Number(idea.raciones) ||
        2,
      dificultad:
        idea.dificultad ===
          'Media' ||
        idea.dificultad ===
          'Elaborada'
          ? idea.dificultad
          : 'Fácil',
      requiereDescongelar:
        false,
      valoracion: 0,
      nota:
        'Receta creada desde Chef Rayku IA 💕',
    })

    setGuardadas(
      (actual) => [
        ...actual,
        idea.nombre || '',
      ]
    )
  }

  return (
    <section
      className="card"
      style={{
        background:
          'linear-gradient(135deg, #fffafc, #f7f0ff)',
        borderColor: '#f3bfd2',
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <img
          src="/rayku-chef.png"
          alt="Chef Rayku"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #f5bfd2',
            background: '#fff0f6',
            boxShadow:
              '0 8px 20px rgba(196, 91, 134, 0.18)',
          }}
        />

        <div>
          <h2
            style={{
              color: '#c45b86',
              fontSize: 22,
              marginBottom: 4,
              fontFamily:
                "'Comic Sans MS', 'Trebuchet MS', cursive",
            }}
          >
            Chef Rayku IA
          </h2>

          <p
            style={{
              color: 'var(--txt2)',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Tu ayudante cute para cocinar, organizar ideas y cuidar tu planning 💕
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          background:
            'linear-gradient(135deg, #fff8fb, #fffaf0)',
          borderColor: '#f5c8d8',
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            color: '#c45b86',
            fontSize: 18,
            marginBottom: 6,
            fontFamily:
              "'Comic Sans MS', 'Trebuchet MS', cursive",
          }}
        >
          💕 Preferencias alimentarias
        </h2>

        <p
          style={{
            color: 'var(--txt2)',
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          Rayku tendrá esto en cuenta al generar recetas e ideas.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          <ListaPreferencias
            titulo="Ingredientes prohibidos"
            emoji="🚫"
            items={
              preferenciasAlimentarias
                .ingredientesProhibidos
            }
            placeholder="Ej: pimiento"
            valor={nuevoProhibido}
            onChange={setNuevoProhibido}
            onAgregar={agregarProhibido}
            onEliminar={
              eliminarIngredienteProhibido
            }
            color="#c45b86"
          />

          <ListaPreferencias
            titulo="Ingredientes favoritos"
            emoji="❤️"
            items={
              preferenciasAlimentarias
                .ingredientesFavoritos
            }
            placeholder="Ej: bacon"
            valor={nuevoFavorito}
            onChange={setNuevoFavorito}
            onAgregar={agregarFavorito}
            onEliminar={
              eliminarIngredienteFavorito
            }
            color="#8a6ec7"
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns:
            'repeat(auto-fit, minmax(190px, 1fr))',
          marginBottom: 14,
        }}
      >
        {ACCIONES.map((accion) => {
          const estaCargando =
            cargando === accion.tipo

          return (
            <button
              key={accion.tipo}
              type="button"
              className="btn-secundario"
              disabled={Boolean(cargando)}
              onClick={() =>
                consultar(accion.tipo)
              }
              style={{
                opacity:
                  cargando &&
                  !estaCargando
                    ? 0.55
                    : 1,
                minHeight: 82,
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'left',
                gap: 5,
              }}
            >
              <strong>
                {estaCargando
                  ? '✨ Rayku está pensando...'
                  : accion.titulo}
              </strong>

              <span
                style={{
                  fontSize: 12,
                  color: 'var(--txt2)',
                  fontWeight: 700,
                }}
              >
                {accion.descripcion}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div
          className="card"
          style={{
            background: '#fff0f6',
            borderColor: '#f4a7b9',
            color: '#a04466',
            fontWeight: 800,
            marginTop: 12,
          }}
        >
          {error}
        </div>
      )}

      {respuesta && (
        <ChefRaykuRespuesta
          respuesta={respuesta}
          onGuardarReceta={
            guardarRecetaIA
          }
          recetasGuardadas={
            guardadas
          }
        />
      )}
    </section>
  )
}