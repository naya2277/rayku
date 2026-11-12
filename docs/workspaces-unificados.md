# Rayku 2.0 — Espacios unificados (decisión de producto y migración)

## Contrato funcional
La interfaz de Planning, Calendario, Recetas, Inventario y Compra es **la misma** en el espacio personal y en Domus Infinita. El selector de espacio cambia el ámbito de lectura y escritura, no la funcionalidad. El tablero manual HogarCompartido es provisional y debe retirarse cuando la experiencia real esté conectada.

- Personal: datos privados por usuario.
- Hogar: datos visibles y editables por miembros autorizados.
- Copiar/publicar una receta o un plan entre ámbitos requiere acción explícita; no mueve ni elimina el original.
- Preferencias, alergias, restricciones y credenciales son individuales, no se comparten por defecto.
- En hogar, generar propuestas combina restricciones de comensales seleccionados y escala ingredientes por raciones; una receta incompatible no se propone sin aviso.
- La compra se deriva del planning y las recetas del ámbito activo, resta el inventario de ese mismo ámbito, permite productos manuales y sincroniza checks y recepción con ese ámbito.
- Al cambiar de ámbito no deben aparecer datos del anterior, ni guardarse cambios pendientes en el equivocado.
- No convertir datos existentes de rayku_data en datos compartidos sin consentimiento.

## Estado técnico observado (11-11-2026)
- App.tsx sincroniza recetas, inventario, planning y compra contra rayku_data por usuario.
- Planning.tsx, Compra.tsx e Inventario.tsx consumen useRaykuStore sin ámbito.
- HogarCompartido.tsx mantiene una segunda compra manual y calendario simplificado en un solo registro shopping_list.
- workspace_records y RPC de escritura optimista existen, pero no alimentan las páginas normales.
- perfilHogar usa una clave global de localStorage: debe aislarse por usuario y ámbito adecuado.

## Plan de integración, por orden
1. Contexto activo tipado (personal/userId o household/householdId), persistido por usuario, con comprobación de pertenencia; selector en navegación principal.
2. Adaptador único de datos para recetas, planning, inventario, compraManual y checksCompra. Leer/escribir rayku_data personal existente sin pérdida; workspace_records para hogar. Normalizar payloads; usar version para conflictos.
3. Al cambiar de ámbito: bloquear escrituras pendientes, cargar snapshot completo y sustituir de forma atómica los slices; desactivar autosaves mientras se hidrata. No usar localStorage global como fuente de datos de otro usuario.
4. Enlazar las páginas existentes con ese adaptador, sin duplicar componentes. Conservar generador de propuestas, recetas, inventario, compra automática, modo supermercado y acciones de cocinado.
5. Añadir copiar a hogar / copiar a mi espacio para recetas y planning, con vista previa y confirmación. Registrar origen para evitar duplicados.
6. Preferencias personales por usuario; seleccionar comensales y raciones en planificación compartida. Aplicar unión segura de restricciones.
7. Sincronización multiusuario: revalidación al recuperar foco y tras cambios, detección de versiones, resolución explícita de conflictos. Probar simultaneidad.
8. Eliminar el tablero provisional tras pruebas de paridad y migración de sus entradas manuales.

## Pruebas obligatorias
- Una persona planifica en personal: la otra no lo ve.
- Planifica en hogar: ambas cuentas ven la misma receta, cantidades y fecha.
- Generación de compra a partir de planificación compartida, restando inventario compartido.
- Marcar comprado actualiza lista e inventario compartidos sin doble consumo.
- Cambiar rápidamente de espacio no mezcla datos ni los sobreescribe.
- Recetas personales existentes se conservan tras despliegue y cierre de sesión.
- Copiar un plan no lo elimina del origen; cambios posteriores no se propagan sin nueva acción.
- Dos cuentas editando a la vez reciben datos consistentes o un conflicto recuperable.
