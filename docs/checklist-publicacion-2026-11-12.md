# Rayku 2.0 — verificación y lanzamiento de preview (12 noviembre 2026)

## Estado técnico confirmado el 11-11-2026
- Rama: `rayku-2.0`; el commit `1a80959c` pasó las DOS ejecuciones de GitHub Actions (pruebas Node + `npm run build`).
- Supabase Rayku (`dtdonemzsilmweojlwom`): ACTIVE_HEALTHY.
- Edge Functions `chef-rayku` y `rayku-ofertas`: ACTIVE.
- Datos de supermercado: tablas `rayku_household_prices`, `rayku_supermarket_prices`, `rayku_supermarket_preferences`, `rayku_public_offers` y `rayku_offers_refresh` presentes.
- Migración aditiva `20261111_011_supermarket_prices_sale_mode.sql` aplicada: columna `sale_mode` en precios por hogar, `envase` por defecto, `granel` opcional.
- Comprobada la publicación de cambios de `rayku_supermarket_prices`, `rayku_supermarket_preferences` y `rayku_household_prices` en `supabase_realtime`. Esto confirma configuración, NO prueba funcional con dos sesiones.
- Comparador: costes de envase completo por defecto, granel proporcional solo cuando se declara; UI y guardado en hogar implementados, con tests Node añadidos.
- Ofertas: ALDI tiene 5 filas vigentes verificadas en la BD. **Lidl todavía no tiene filas verificadas**; no prometer cobertura ni inventar valores. La UI presenta el estado de ambas fuentes, incluso si una está vacía.
- En Vercel se identificó el equipo correcto `team_yD8zqodAozmdMXXgNutdzNga` (slug `planningdecomidas`) y el proyecto `prj_cOaYx5ZCS5jPtFVK8qBFT8iAXYlm`. Deployments READY previos son previews de commits antiguos.
- La tarea programada «Publicar Rayku 2.0» está actualizada para las 19:00 Europe/Madrid el 12-11-2026; NO publicará a producción y no debe repetir intentos si falla por cuota.

## Verificaciones técnicas pendientes
- [ ] Confirmar que el último SHA del momento de publicar coincide con una CI completa verde, no basta `1a80959c` si hay commits nuevos.
- [ ] Comprobar en la app real que crear/editar `sale_mode` persiste y sincroniza para ambos miembros del hogar.
- [ ] Validar la disponibilidad, precios y condiciones en folletos Lidl; no usar su catálogo si no se puede garantizar precio, unidad y vigencia. La función actual requiere JSON-LD Product con fechas y unidades verificables; las páginas pueden no ofrecerlo.
- [ ] Probar manualmente distintos productos de tienda, precios incompletos y notas de compra. El precio incompleto debe verse como parcial.
- [ ] Probar RLS autenticándose con dos usuarios/otro hogar, sin modificar datos reales.
- [ ] Confirmar que la preview se puede abrir con las restricciones SSO de Vercel.

## Prueba funcional real de la preview
- [ ] Entrar con dos cuentas en dos dispositivos y comprobar sync bidireccional.
- [ ] Proponer menú, rechazar sin alterar calendario, aceptar con confirmación.
- [ ] Crear receta, revisar raciones, necesidades y descuento correcto del inventario.
- [ ] Marcar compra realizada y comprobar que entra una sola vez en cocina; deshacer.
- [ ] Registrar lotes de inventario, nevera/congelador, fechas y sobras seguras.
- [ ] Guardar precio por envase y a granel con dos cuentas; comparador recalcula importes.
- [ ] Confirmar oferta vigente, caducada, Lidl Plus y ausencia de fuente verificada.
- [ ] Comprobar móvil, tablet, PWA, cerrar/abrir sesión, offline/reconexión.

## Acciones para el despliegue (automático cuando toque)
1. Leer el SHA actual de `rayku-2.0` y sus últimos GitHub Actions.
2. Si CI verde y Vercel lo permite, reutilizar preview READY del mismo SHA o crear **exactamente una** preview nueva desde esa rama; **no** promocionar a producción ni tocar `main`.
3. Registrar SHA desplegado, URL, estado READY y cualquier error, cuota o SSO.
4. Probar en la preview, no en datos reales que puedan perderse.
5. Mantener `rayku.vercel.app` sin cambios hasta completar validación manual.

Se distingue explícitamente comprobación automática de prueba funcional real.
