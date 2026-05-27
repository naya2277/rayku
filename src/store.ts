import { create } from 'zustand'
import {
  subirRecetas,
  descargarRecetas,

  subirInventario,
  descargarInventario,

  subirPlanning,
  descargarPlanning,
} from './lib/sync'

const generarId = () => {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID()
  }

  return (
    Math.random()
      .toString(36)
      .substring(2) +
    Date.now().toString(36)
  )
}

export type Dificultad =
  | 'Fácil'
  | 'Media'
  | 'Elaborada'

export type TipoComida =
  | 'comida'
  | 'cena'

export type Receta = {
  id: string
  nombre: string
  imagen: string
  favorita: boolean
  ingredientes: string[]
  pasos: string
  tiposComida: string[]
  ingredientesBase: string[]
  dietas: string[]
  caracteristicas: string[]
  tiempo: number
  raciones: number
  dificultad: Dificultad
  requiereDescongelar: boolean
  valoracion: number
  nota: string
}

export type ItemPlanning = {
  id: string
  fecha: string
  tipoComida: TipoComida
  recetaId: string | null
  comidaLibre: string
  nota: string
  racionesOverride?: number | null
}

export type ItemInventario = {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  categoria: string
  ubicacion:
    | 'nevera'
    | 'congelador'
    | 'despensa'
  fechaCaducidad: string | null
  fechaDescongelar?: string | null
  necesitaDescongelar: boolean
}

type Estado = {
  recetas: Receta[]
  planning: ItemPlanning[]
  semanas: any[]
  listaCompra: any[]
  inventario: ItemInventario[]
  recordatorios: any[]

  addReceta: (
    receta: Receta
  ) => void

  updateReceta: (
    id: string,
    data: Partial<Receta>
  ) => void

  deleteReceta: (
    id: string
  ) => void

  duplicarReceta: (
    id: string
  ) => void

  toggleFavorita: (
    id: string
  ) => void

  sincronizarRecetasDesdeSupabase: (
    userId: string
  ) => Promise<void>

  guardarRecetasEnSupabase: (
    userId: string
  ) => Promise<void>

  sincronizarInventarioDesdeSupabase: (
    userId: string
  ) => Promise<void>

  guardarInventarioEnSupabase: (
    userId: string
  ) => Promise<void>

  sincronizarPlanningDesdeSupabase: (
    userId: string
  ) => Promise<void>

  guardarPlanningEnSupabase: (
    userId: string
  ) => Promise<void>

  guardarHuecoPlanning: (
    item: Omit<
      ItemPlanning,
      'id'
    >
  ) => void

  limpiarHuecoPlanning: (
    fecha: string,
    tipoComida: TipoComida
  ) => void

  agregarItemInventario: (
    item: ItemInventario
  ) => void

  editarItemInventario: (
    id: string,
    data: Partial<ItemInventario>
  ) => void

  eliminarItemInventario: (
    id: string
  ) => void
}

const normalizarReceta = (
  r: any
): Receta => ({
  id: r.id ?? generarId(),

  nombre: r.nombre ?? '',

  imagen: r.imagen ?? '',

  favorita:
    r.favorita ?? false,

  ingredientes:
    Array.isArray(
      r.ingredientes
    )
      ? r.ingredientes
      : [],

  pasos: r.pasos ?? '',

  tiposComida:
    Array.isArray(
      r.tiposComida
    )
      ? r.tiposComida
      : [],

  ingredientesBase:
    Array.isArray(
      r.ingredientesBase
    )
      ? r.ingredientesBase
      : [],

  dietas: Array.isArray(
    r.dietas
  )
    ? r.dietas
    : [],

  caracteristicas:
    Array.isArray(
      r.caracteristicas
    )
      ? r.caracteristicas
      : [],

  tiempo:
    Number(r.tiempo) || 0,

  raciones:
    Number(r.raciones) || 1,

  dificultad:
    r.dificultad ??
    'Fácil',

  requiereDescongelar:
    r.requiereDescongelar ??
    false,

  valoracion:
    Number(r.valoracion) || 0,

  nota: r.nota ?? '',
})

const normalizarInventario = (
  item: any
): ItemInventario => ({
  id: item.id ?? generarId(),

  nombre: item.nombre ?? '',

  cantidad:
    Number(item.cantidad) || 0,

  unidad:
    item.unidad ?? 'g',

  categoria:
    item.categoria ?? 'otros',

  ubicacion:
    item.ubicacion ??
    'despensa',

  fechaCaducidad:
    item.fechaCaducidad ??
    null,

  fechaDescongelar:
    item.fechaDescongelar ??
    null,

  necesitaDescongelar:
    item.necesitaDescongelar ??
    false,
})

const normalizarPlanning = (
  item: any
): ItemPlanning => ({
  id: item.id ?? generarId(),

  fecha: item.fecha ?? '',

  tipoComida:
    item.tipoComida ??
    'comida',

  recetaId:
    item.recetaId ?? null,

  comidaLibre:
    item.comidaLibre ?? '',

  nota: item.nota ?? '',

  racionesOverride:
    item.racionesOverride ??
    null,
})

const cargar = <T,>(
  key: string,
  fallback: T
): T => {
  try {
    const raw =
      localStorage.getItem(
        key
      )

    if (!raw)
      return fallback

    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const guardar = (
  key: string,
  data: unknown
) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(data)
    )
  } catch (error) {
    console.error(
      `Error guardando ${key}:`,
      error
    )
  }
}

const guardarRecetasLocal = (
  recetas: Receta[]
) => {
  guardar(
    'rayku-recetas',
    recetas
  )
}

const guardarInventarioLocal =
  (
    inventario: ItemInventario[]
  ) => {
    guardar(
      'rayku-inventario',
      inventario
    )
  }

const guardarPlanningLocal = (
  planning: ItemPlanning[]
) => {
  guardar(
    'rayku-planning',
    planning
  )
}

export const useRaykuStore =
  create<Estado>(
    (set, get) => ({
      recetas: cargar<any[]>(
        'rayku-recetas',
        []
      ).map(normalizarReceta),

      planning: cargar<any[]>(
        'rayku-planning',
        []
      ).map(
        normalizarPlanning
      ),

      semanas: [],

      listaCompra: [],

      inventario:
        cargar<any[]>(
          'rayku-inventario',
          []
        ).map(
          normalizarInventario
        ),

      recordatorios: [],

      addReceta: (
        receta
      ) => {
        const nuevaReceta =
          normalizarReceta({
            ...receta,

            id:
              receta.id ||
              generarId(),
          })

        const nuevas = [
          ...get().recetas,
          nuevaReceta,
        ]

        guardarRecetasLocal(
          nuevas
        )

        set({
          recetas: nuevas,
        })
      },

      updateReceta: (
        id,
        data
      ) => {
        const nuevas =
          get().recetas.map(
            (r) =>
              r.id === id
                ? normalizarReceta(
                    {
                      ...r,
                      ...data,
                      id: r.id,
                    }
                  )
                : r
          )

        guardarRecetasLocal(
          nuevas
        )

        set({
          recetas: nuevas,
        })
      },

      deleteReceta: (
        id
      ) => {
        const nuevas =
          get().recetas.filter(
            (r) =>
              r.id !== id
          )

        guardarRecetasLocal(
          nuevas
        )

        set({
          recetas: nuevas,
        })
      },

      duplicarReceta: (
        id
      ) => {
        const receta =
          get().recetas.find(
            (r) =>
              r.id === id
          )

        if (!receta)
          return

        const copia =
          normalizarReceta({
            ...receta,

            id: generarId(),

            nombre: `${receta.nombre} (copia)`,

            favorita: false,
          })

        const nuevas = [
          copia,
          ...get().recetas,
        ]

        guardarRecetasLocal(
          nuevas
        )

        set({
          recetas: nuevas,
        })
      },

      toggleFavorita: (
        id
      ) => {
        const nuevas =
          get().recetas.map(
            (r) =>
              r.id === id
                ? {
                    ...r,
                    favorita:
                      !r.favorita,
                  }
                : r
          )

        guardarRecetasLocal(
          nuevas
        )

        set({
          recetas: nuevas,
        })
      },

      sincronizarRecetasDesdeSupabase:
        async (
          userId
        ) => {
          const recetasSupabase =
            await descargarRecetas(
              userId
            )

          if (
            Array.isArray(
              recetasSupabase
            )
          ) {
            const recetasNormalizadas =
              recetasSupabase.map(
                normalizarReceta
              )

            guardarRecetasLocal(
              recetasNormalizadas
            )

            set({
              recetas:
                recetasNormalizadas,
            })
          }
        },

      guardarRecetasEnSupabase:
        async (
          userId
        ) => {
          await subirRecetas(
            get().recetas,
            userId
          )
        },

      sincronizarInventarioDesdeSupabase:
        async (
          userId
        ) => {
          const inventarioSupabase =
            await descargarInventario(
              userId
            )

          if (
            Array.isArray(
              inventarioSupabase
            )
          ) {
            const inventarioNormalizado =
              inventarioSupabase.map(
                normalizarInventario
              )

            guardarInventarioLocal(
              inventarioNormalizado
            )

            set({
              inventario:
                inventarioNormalizado,
            })
          }
        },

      guardarInventarioEnSupabase:
        async (
          userId
        ) => {
          await subirInventario(
            get().inventario,
            userId
          )
        },

      sincronizarPlanningDesdeSupabase:
        async (
          userId
        ) => {
          const planningSupabase =
            await descargarPlanning(
              userId
            )

          if (
            Array.isArray(
              planningSupabase
            )
          ) {
            const planningNormalizado =
              planningSupabase.map(
                normalizarPlanning
              )

            guardarPlanningLocal(
              planningNormalizado
            )

            set({
              planning:
                planningNormalizado,
            })
          }
        },

      guardarPlanningEnSupabase:
        async (
          userId
        ) => {
          await subirPlanning(
            get().planning,
            userId
          )
        },

      guardarHuecoPlanning:
        (item) => {
          const actual =
            get().planning

          const existe =
            actual.find(
              (h) =>
                h.fecha ===
                  item.fecha &&
                h.tipoComida ===
                  item.tipoComida
            )

          const nuevoPlanning =
            existe
              ? actual.map(
                  (h) =>
                    h.id ===
                    existe.id
                      ? normalizarPlanning(
                          {
                            ...h,
                            ...item,
                            id: h.id,
                          }
                        )
                      : h
                )
              : [
                  ...actual,
                  normalizarPlanning(
                    {
                      ...item,
                      id: generarId(),
                    }
                  ),
                ]

          guardarPlanningLocal(
            nuevoPlanning
          )

          set({
            planning:
              nuevoPlanning,
          })
        },

      limpiarHuecoPlanning:
        (
          fecha,
          tipoComida
        ) => {
          const nuevoPlanning =
            get().planning.filter(
              (h) =>
                !(
                  h.fecha ===
                    fecha &&
                  h.tipoComida ===
                    tipoComida
                )
            )

          guardarPlanningLocal(
            nuevoPlanning
          )

          set({
            planning:
              nuevoPlanning,
          })
        },

      agregarItemInventario:
        (item) => {
          const nuevoInventario =
            [
              ...get()
                .inventario,

              normalizarInventario(
                {
                  ...item,
                  id:
                    item.id ||
                    generarId(),
                }
              ),
            ]

          guardarInventarioLocal(
            nuevoInventario
          )

          set({
            inventario:
              nuevoInventario,
          })
        },

      editarItemInventario:
        (
          id,
          data
        ) => {
          const nuevoInventario =
            get().inventario.map(
              (item) =>
                item.id === id
                  ? normalizarInventario(
                      {
                        ...item,
                        ...data,
                        id: item.id,
                      }
                    )
                  : item
            )

          guardarInventarioLocal(
            nuevoInventario
          )

          set({
            inventario:
              nuevoInventario,
          })
        },

      eliminarItemInventario:
        (id) => {
          const nuevoInventario =
            get().inventario.filter(
              (
                item
              ) =>
                item.id !==
                id
            )

          guardarInventarioLocal(
            nuevoInventario
          )

          set({
            inventario:
              nuevoInventario,
          })
        },
    })
  )