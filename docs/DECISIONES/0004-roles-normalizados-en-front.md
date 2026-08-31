# 0004 — Homogeneizar roles con un normalizador en el frontend

**Fecha:** 2026-08-31 · **Estado:** aceptada

## Contexto

`menuConfig.rolesPermitidos` no contiene roles: contiene **nombres de personas** mezclados
con roles — `["admin", "Angeles", "Blanca", "Candy", "Mia"]`. En la base de datos el campo
`Users_credentials.type` tiene valores inconsistentes (`Admin`, `Administrador`, `admin`,
`Driver`). Hay 57 comparaciones literales de `"admin"` sueltas por los componentes.

Conviven dos sistemas de autorización: esos `rolesPermitidos` y los feature flags por
usuario de `features.php` (39 claves, con UI en `AccessManager.jsx`).

## Decisión

1. Catálogo canónico de roles en código (`shared/auth/roles.js`).
2. Un `normalizeRole(raw)` que mapea todos los valores existentes al catálogo, con default
   al rol de **menor** privilegio.
3. Se conserva el sistema de feature flags y se le pone encima una capa de rol:
   `permisos = defaults del rol ∪/∖ overrides del usuario`, con nomenclatura
   `modulo.accion`.
4. La migración de la base de datos (tablas `roles`, `permissions`, `user_roles`) se hace
   en la fase 3, **después**.

## Razones

- Homogeneizar primero en el front desacopla la limpieza de la migración de datos: la app
  queda consistente hoy sin un flag day en producción, donde no hay staging ni rollback.
- Es el mismo patrón que ya funcionó en el backend con `normalizarSubcategoria`.
- El sistema de feature flags es la mitad buena de lo que ya existe: granular por usuario y
  con UI. Tirarlo sería perder trabajo hecho.

## Consecuencias

- El normalizador es deuda deliberada y temporal: vive hasta que la fase 3 migre los datos,
  y entonces se borra.
- Un rol desconocido cae a `VIEWER`. Si alguien pierde accesos tras el cambio, es porque su
  valor de `type` no estaba en el mapa: se agrega el alias, no se cambia el default.
- Un `@deprecated` marca `checkAccess` mientras se retiran sus usos.
- **Nada de esto es seguridad.** Esconder un botón no impide un `curl`. Es consistencia de
  experiencia y el punto único donde la fase 2 enchufará la autorización real. Ver ADR 0001.
