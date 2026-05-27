import {
  useEffect,
  useState,
} from 'react'

type Props = {
  racionesReceta: number
  racionesOverride?: number | null
  onGuardar: (
    raciones: number
  ) => void
}

export default function RacionesPlanning({
  racionesReceta,
  racionesOverride,
  onGuardar,
}: Props) {
  const valorInicial =
    racionesOverride ??
    racionesReceta ??
    1

  const [
    valorLocal,
    setValorLocal,
  ] = useState(
    String(valorInicial)
  )

  useEffect(() => {
    setValorLocal(
      String(valorInicial)
    )
  }, [valorInicial])

  const guardar = () => {
    const numero =
      Number(valorLocal)

    if (
      !Number.isFinite(numero) ||
      numero < 1
    ) {
      setValorLocal('1')
      onGuardar(1)
      return
    }

    onGuardar(numero)
  }

  return (
    <div
      style={{
        marginTop: 10,
        background:
          'rgba(255,255,255,0.65)',
        border:
          '1.5px solid #f5dde8',
        borderRadius: 14,
        padding: 10,
      }}
    >
      <label
        style={{
          display: 'flex',
          flexDirection:
            'column',
          gap: 6,
          color: '#8f7080',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        🍽️ Raciones

        <input
          type="number"
          min={1}
          value={valorLocal}
          onChange={(e) =>
            setValorLocal(
              e.target.value
            )
          }
          onBlur={guardar}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          style={{
            maxWidth: 110,
          }}
        />
      </label>

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: '#9e7d90',
          lineHeight: 1.45,
        }}
      >
        💡 La compra se ajustará automáticamente según las raciones.
      </div>
    </div>
  )
}