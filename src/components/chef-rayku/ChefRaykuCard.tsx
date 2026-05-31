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
    tipo: 'cocinar',
    titulo: '🍳 ¿Qué puedo cocinar?',
    descripcion:
      'Ideas usando tu inventario y recetas guardadas.',
  },
  {
    tipo: 'gastar',
    titulo: '📦 ¿Qué debería gastar primero?',
    descripcion:
      'Prioriza productos que caducan pronto.',
  },
  {
    tipo: 'menu_keto',
    titulo: '🥑 Hazme un menú keto',
    descripcion:
      'Comidas sencillas y bajas en carbohidratos.',
  },
]

export default function ChefRaykuCard() {
  const {
    recetas,
    inventario,
    planning,
    historialCocinado,
  } = useRaykuStore()

  const [
    respuesta,
    setRespuesta,
  ] = useState('')

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
        'Chef Rayku no ha podido responder ahora mismo. Revisa la API key de Gemini o inténtalo de nuevo más tarde 💕'
      )
    } finally {
      setCargando(null)
    }
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
            Tu ayudante cute para cocinar con lo que ya tienes 💕
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
        />
      )}
    </section>
  )
}