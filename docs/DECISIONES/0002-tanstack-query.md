# 0002 — TanStack Query para el estado de servidor

**Fecha:** 2026-08-31 · **Estado:** aceptada

## Contexto

94 de 204 archivos llaman `fetch()` directo. 101 usos de `VITE_API_HOST` repartidos por la
app. 68 archivos repiten a mano `setLoading(true)` → `try/catch` → `setLoading(false)`.

No hay caché, ni deduplicación, ni reintentos, ni timeout. Cada navegación vuelve a pedir
todo. Los 14 hooks `useFetchX` son el mismo hook con distinto endpoint.

## Decisión

Se adopta TanStack Query como capa de estado de servidor, sobre un cliente HTTP propio en
`shared/api/client.js`. Zustand se conserva para el estado de sesión y de UI global.

## Razones

- El estado de servidor tiene un ciclo de vida distinto al de UI (se puede quedar viejo,
  se revalida, se comparte). Tratarlo con `useState` es la causa de los 68 bloques
  repetidos.
- Caché, deduplicación, reintentos con backoff y `keepPreviousData` son problema resuelto.
  Escribirlos a mano es reinventar la rueda.
- Es el cambio con mayor retorno por línea tocada: rendimiento, fiabilidad y ~2 000 líneas
  de repetición, todo de una vez.

## Consecuencias

- Dependencia nueva: `@tanstack/react-query`.
- Todo el acceso a datos pasa por `entities/<x>/api`. Ningún componente vuelve a saber que
  del otro lado hay PHP.
- Cuando la fase 2 cambie la autenticación, se edita `client.js` y nada más.
- Hay curva de aprendizaje: `queryKey`, `staleTime` e invalidación. Se documenta con el
  módulo piloto del incremento 2.
