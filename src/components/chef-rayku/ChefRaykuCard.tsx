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

export default function ChefRaykuCard() {
  const {
    recetas,
    inventario,
    planning,
    historialCocinado,
    addReceta,
  } = useRaykuStore()

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