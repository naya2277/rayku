import { useEffect, useRef, useState } from 'react'

import type {
  Dificultad,
  Receta,
} from '../store'

const BORRADOR_KEY =
  'rayku-borrador-receta'

type Props = {
  addReceta: (receta: Receta) => void

  updateReceta: (
    id: string,
    data: Partial<Receta>
  ) => void

  setBusqueda: (valor: string) => void
}

export function useFormularioReceta({
  addReceta,
  updateReceta,
  setBusqueda,
}: Props) {
  const ultimoGuardadoRef =
    useRef(0)

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

  return {
    mensaje,

    mostrarFormulario,
    setMostrarFormulario,

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

    limpiarFormulario,
    cargarRecetaEnFormulario,
    guardarReceta,
  }
}