# 0003 — No migrar a TypeScript en la fase 1

**Fecha:** 2026-08-31 · **Estado:** aceptada

## Contexto

El proyecto son 204 archivos y 39 745 líneas de JavaScript sin tipos. Se evaluó migrar a
TypeScript como parte del refactor.

## Decisión

No se migra a TypeScript durante la fase 1. Se adopta **zod** para validar en la frontera
con la API. Decisión revisable después.

## Razones

1. **Convertir 40 000 líneas mientras Richard mete features a diario** es exactamente el
   tipo de trabajo que mató la rama `refactor` anterior. Dos cambios grandes a la vez se
   estorban entre sí.
2. **Contra una API sin tipos, TS da falsa seguridad.** Los tipos desaparecen en runtime,
   que es justo donde llegan los datos malos de un PHP que devuelve `"1"` donde se espera
   `1`. Anotar `Gasto` no impide que llegue otra cosa.
3. **zod sí resuelve el problema real**: valida en ejecución, falla en un punto
   identificable, y de paso infiere tipos si algún día se migra.

## Consecuencias

- La documentación del contrato recae en JSDoc, que por eso es obligatorio (ver ADR 0004 y
  `refactor/06-DOCUMENTACION.md`).
- Vite compila `.ts` y `.jsx` mezclados sin configuración extra: la puerta queda abierta.
  Si se retoma, se empieza por `shared/` y `entities/`, que son archivos nuevos.
- Sin verificación en tiempo de compilación, la red de seguridad son los tests y zod.
