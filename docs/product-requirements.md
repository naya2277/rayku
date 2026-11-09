# Rayku 2.0 — experiencia completa de cocina y compra

## Principio
Una interfaz sencilla, con cinco destinos principales: **Hoy**, **Menú**, **Compra**, **Cocina** y **Mis gustos**. Cada paso permite editar, deshacer y corregir. El usuario solicita las sugerencias; nunca se cambia el calendario sin confirmar.

## Flujo de extremo a extremo

1. **Mis gustos (cuestionario corto y editable)**: perfiles por comensal, ingredientes prohibidos, preferencias y favoritos, dietas, alergias/intolerancias, horarios, tiempo disponible, presupuesto orientativo y comidas que no desean repetir. Distinguir preferencias estrictas de simples aversiones; no inferir alergias. Los perfiles personales pueden participar en un menú de hogar sin exponer datos personales innecesarios.
2. **Proponer menú**: botón «Crear menú semanal» con fechas, comensales y número de raciones. Usar recetas guardadas y sugerencias nuevas, respetando exclusiones estrictas y disponibilidad en Cocina. Mostrar propuesta antes de aplicarla. Permitir reemplazar, mover, editar o eliminar cualquier plato. Solo «Añadir al calendario» guarda los cambios.
3. **Calcular necesidades**: ingredientes estructurados por receta, cantidades, unidades y raciones; sumar ingredientes equivalentes y normalizar unidades compatibles. No descontar un ingrediente si su unidad no es convertible sin confirmación. Considerar inventario utilizable, reservas para otros menús y fechas de caducidad. Mostrar desglose «necesario / disponible / por comprar» y permitir corregirlo.
4. **Lista de compra**: lista persistente, sincronizada entre miembros del hogar, con artículos manuales, casillas de comprado, cantidades editables, notas y categorías. Clasificar en dos dimensiones independientes: familia comercial (carne, pescado, verduras, fruta, lácteos, despensa, etc.) y grupo nutricional predominante (proteínas, carbohidratos, grasas, mixto/otros). No equiparar «familia» con «macronutriente».
5. **Compra hecha**: únicamente los artículos marcados como comprados pasan a una **bandeja de entrada de Cocina**, sin asignar ubicación arbitraria. Se puede corregir cantidad, dividir entre ubicaciones, añadir lote y fecha, o deshacer. Los artículos no comprados permanecen en la lista.
6. **Cocina**: inventario por lotes en despensa, nevera o congelador; nombre, cantidad, unidad, fecha de entrada, caducidad introducida por el usuario, tipo (crudo, preparado, cocinado), fecha de cocinado, fecha de congelación y estado. Permitir trasladar, consumir parcialmente, dividir, editar, eliminar y registrar sobras.
7. **Avisos**: fechas explícitas y estimaciones conservadoras diferenciadas. Para un plato cocinado guardado en nevera, proponer recordatorio a los 2 días («Hoy o mañana conviene consumir los macarrones»), con fecha ajustable y sin afirmar que una estimación garantiza seguridad alimentaria. Para congelados y despensa, usar fechas introducidas por el usuario o pautas configurables por alimento; no inventar una caducidad universal. Avisos dentro de la app; notificaciones push solo tras permiso y soporte verificado en cada plataforma.

## Reglas de producto
- Los cambios manuales tienen prioridad sobre propuestas automáticas.
- Regenerar una lista no borra compras marcadas ni artículos manuales.
- Los artículos de compra se identifican por ID estable; no por nombre.
- «Compra hecha» es una operación transaccional e idempotente: no duplica stock al pulsar dos veces.
- El calendario conserva cambios manuales y solicita confirmación antes de sobrescribir.
- El inventario registra cantidades por lote para respetar fechas distintas de un mismo producto.
- El estado de sincronización se muestra claramente; sin conexión se conservan operaciones pendientes.
- Accesibilidad y móvil primero: acciones principales grandes, pantallas simples, filtros opcionales y detalles avanzados plegables.

## Estado respecto al repositorio actual
- Hay recetas, planning, inventario, compra y preferencias básicas ya implementados, pero **no** está garantizado el flujo integral descrito aquí.
- El selector de espacios en la rama `rayku-2.0` es todavía una vista previa.
- Este documento establece requisitos; no implica que el generador de menús, el traspaso de compras o los avisos ya funcionen.

## Orden de implementación
1. Datos estructurados de ingredientes, perfiles y lotes de inventario; migración no destructiva.
2. Compra editable y persistente, con «Compra hecha» y bandeja de entrada.
3. Cuestionario y motor de menú con revisión previa y edición.
4. Cálculo de cantidades y descuento de inventario.
5. Avisos de consumo y caducidad.
6. Sincronización compartida y pruebas reales Android/iOS en todos los flujos.
