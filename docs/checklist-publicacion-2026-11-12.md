# Rayku 2.0 — comprobación antes de publicar (12 noviembre 2026)

## Estado verificado el 11-11-2026
- Rama de trabajo: `rayku-2.0`.
- GitHub Actions: última ejecución del commit `ec5d3343` correcta (pruebas Node + compilación).
- Supabase proyecto Rayku: ACTIVE_HEALTHY.
- Edge Functions: `chef-rayku` y `rayku-ofertas` ACTIVE.
- Tablas presentes: `rayku_household_prices`, `rayku_supermarket_prices`, `rayku_supermarket_preferences`, `rayku_public_offers`, `rayku_offers_refresh`.
- Ofertas ALDI: 5 filas vigentes; última importación correcta 11-11-2026 15:19 UTC; sin error registrado.
- Ofertas Lidl: sin filas en `rayku_public_offers` ni registro de éxito en `rayku_offers_refresh` en la comprobación. No declarar cobertura automática Lidl hasta verificar.
- Vercel: proyecto localizado en el equipo `team_yD8zqodAozmdMXXgNutdzNga`; despliegues preview antiguos READY, no equivalen a versión final publicada.
- No realizar despliegue de producción sin confirmar que el commit publicado coincide con el validado.

## Bloqueantes o decisiones pendientes
1. Comparador: `costeIngrediente` calcula el precio proporcional incluso para envases indivisibles; distinguir venta a granel de paquete cerrado y mostrar coste en caja, no solo coste consumido. Añadir pruebas de 250 g necesitados frente a paquete cerrado de 1 kg, y de unidades/paquetes indivisibles. No presumir que todo precio por kg corresponde a paquete indivisible.
2. Ofertas: investigar cobertura real de Lidl y mostrar explícitamente en interfaz que una fuente todavía no ofrece datos comprobados.
3. Comprobar que ofertas caducadas y condiciones Lidl Plus nunca entran en la propuesta sin consentimiento.
4. Comprobar precio completo: cuando faltan artículos o hay notas manuales, el resultado debe quedar claramente marcado como parcial.
5. Validar el comportamiento de la selección de tiendas y coste adicional de paradas con un carrito de compra real, especialmente cuando solo se conocen precios de algunos artículos.

## Prueba funcional manual previa a lanzamiento
- [ ] Iniciar sesión con dos cuentas distintas, seleccionar el mismo hogar y comprobar sincronización en ambas direcciones.
- [ ] Crear propuesta de menú; rechazarla y comprobar que el calendario no cambia; aceptarla y comprobar que se sincroniza.
- [ ] Crear receta con ingredientes y raciones; verificar cantidades, inventario y faltantes.
- [ ] Marcar artículo como comprado; confirmar que pasa una sola vez a bandeja de inventario.
- [ ] Registrar sobras con fecha, ubicación y cantidad; comprobar que no recomienda sobras caducadas ni de edad desconocida.
- [ ] Abrir Supermercados y ahorro, cambiar preferencia en una cuenta y comprobar visibilidad en la otra.
- [ ] Mostrar estados de las fuentes de ofertas, incluso cuando Lidl esté sin importación.
- [ ] Probar modo tablet, móvil, cierre/apertura de sesión y navegación PWA.
- [ ] Verificar políticas RLS y llamadas autenticadas sin dar acceso a datos de otro hogar.

## Publicación
- [ ] Confirmar cuota y disponibilidad de Vercel.
- [ ] Confirmar commit SHA exacto que se va a publicar.
- [ ] Ejecutar comprobaciones GitHub Actions completas en ese SHA.
- [ ] Publicar únicamente después de las verificaciones pendientes.
- [ ] Abrir dominio de producción y comprobar menús, compra, inventario, sesión y supermercados.
- [ ] Registrar resultado, URL y SHA de despliegue.

Esta lista distingue comprobaciones reales de pruebas aún no realizadas; no supone que las casillas pendientes estén superadas.
