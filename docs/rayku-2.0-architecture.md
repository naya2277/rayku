# Rayku 2.0 — arquitectura de espacios (borrador)

## Objetivo
Permitir a cada usuario autenticado trabajar tanto en su espacio personal como en uno o más hogares compartidos, sin perder las recetas y datos existentes.

## Modelo propuesto (Supabase)

- `households`: `id uuid primary key`, `name text`, `created_by uuid references auth.users`, `created_at timestamptz`.
- `household_members`: `household_id uuid`, `user_id uuid`, `role text` ('owner'|'member'), `joined_at timestamptz`; clave primaria compuesta (`household_id`, `user_id`).
- `workspace_records`: `id uuid primary key`, `owner_user_id uuid null`, `household_id uuid null`, `kind text`, `payload jsonb`, `version bigint`, `updated_at timestamptz`, `updated_by uuid`. Restricción: exactamente uno entre `owner_user_id` y `household_id` debe ser no nulo.

Tipos iniciales de `kind`: `recipes`, `inventory`, `planning`, `shopping_list`. La lista manual y sus checks se migrarán al registro `shopping_list`; la lista de compra no dependerá exclusivamente de recalcular el planning.

## Seguridad

- Habilitar RLS en las tres tablas.
- Datos personales: lectura/escritura solo para `owner_user_id = auth.uid()`.
- Datos de hogar: lectura/escritura solo para miembros verificados mediante `household_members`.
- La creación de membresías y los roles requieren políticas que impidan que un usuario se añada por sí solo a un hogar ajeno o eleve su rol.
- No introducir claves secretas de servidor en variables `VITE_*`.

## Sincronización y funcionamiento sin conexión

1. Cada registro tendrá versión y fecha de actualización; no se reemplazará silenciosamente un dato local más nuevo.
2. Los cambios se guardarán automáticamente; una cola local de cambios pendientes permitirá uso sin conexión.
3. La interfaz distinguirá «guardado en este dispositivo», «sincronizando» y «sincronizado».
4. La lista de compra será persistente y compartible, con operaciones idempotentes por elemento para evitar perder cambios concurrentes.
5. La aplicación deberá funcionar en Android y en iOS como PWA, con pruebas de cierre/reapertura y pérdida de conexión.

## Migración sin pérdida

- Mantener `rayku_data` sin modificar durante la primera fase.
- Antes de migrar, respaldar tanto los datos cloud como los locales disponibles; el CSV de Supabase no contiene necesariamente los elementos de compra manual.
- Leer explícitamente las filas duplicadas existentes por usuario y tipo; no elegir arbitrariamente la primera.
- Crear un migrador repetible y verificable con vista previa; no borrar los datos originales.
- Probar las políticas RLS con dos usuarios y comprobar aislamiento personal y acceso compartido.

## Fases

1. Diseñar y validar esquema SQL, RLS y migración.
2. Añadir selector de espacio y estado de sincronización.
3. Implementar compra persistente, offline y compartida.
4. Migrar recetas, inventario y planificación.
5. Optimizar automatización y experiencia móvil.

Este documento es un diseño inicial: todavía no se han aplicado migraciones ni cambiado el comportamiento de la app en producción.
