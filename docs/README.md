# Documentación de IMA Desktop

Aplicación de escritorio (Electron + React + Vite) para la operación de IMA Express:
viajes, gastos, mantenimientos, finanzas, nómina, safety y seguimiento de unidades.

## Por dónde empezar

| Si eres… | Lee |
|---|---|
| Alguien nuevo en el proyecto | `ONBOARDING.md` → `ARQUITECTURA.md` → `GLOSARIO.md` |
| Quien va a escribir código | `CONTRIBUYENDO.md` |
| Quien va a tocar la API | `API-ENDPOINTS.md` |
| Quien necesita saber de roles o permisos | `ROLES-Y-PERMISOS.md` |
| Quien retoma el refactor | `refactor/00-ESTADO.md` |
| Quien pregunta "¿por qué se hizo así?" | `DECISIONES/` |

## Índice

```
docs/
  README.md            Este archivo
  ONBOARDING.md        De cero a la app corriendo            (pendiente)
  ARQUITECTURA.md      Estructura del código y sus reglas    (pendiente — hoy en refactor/02)
  CONTRIBUYENDO.md     Convenciones de trabajo
  GLOSARIO.md          Términos del dominio                  (pendiente — incremento 4)
  API-ENDPOINTS.md     Catálogo de la API PHP
  ROLES-Y-PERMISOS.md  Roles, permisos y su migración
  sql/                 Migraciones propuestas; ninguna se ha corrido
  MODULOS/             Un archivo por módulo funcional
                       nomina.md · el módulo de referencia del refactor
  DECISIONES/          ADRs: por qué se decidió cada cosa
                       0005 · proveedor de tiles: riesgo aceptado y alternativas
  api/                 Referencia generada desde JSDoc — NO editar a mano
  refactor/            Plan del refactor en curso
```

Los "pendiente" no son olvidos: cada uno tiene asignado el incremento del refactor en el
que se escribe. Ver `refactor/06-DOCUMENTACION.md`.

## Estado del proyecto

El código está en pleno refactor por incrementos. Conviven dos estructuras:

- **`src/screens/`, `src/components/`** — estructura antigua, se va vaciando.
- **`src/{app,pages,features,entities,shared}/`** — estructura destino.

El linter conoce la diferencia: en la estructura nueva, JSDoc y las reglas de dependencia
son **error**; en la vieja son **warning**. Un módulo que se migra ya no puede regresar.

## Comandos

```bash
npm run dev          # Vite en desarrollo
npm start            # Electron sobre el build
npm run build        # Compila el frontend
npm test             # Tests (vitest)
npm run lint         # ESLint: arquitectura + JSDoc + seguridad
npm run docs:api     # Regenera docs/api/ desde los bloques JSDoc
npm run dist         # Empaqueta la app de escritorio
```

## Advertencias operativas

- **La API no tiene HTTPS funcional.** El puerto 443 acepta TCP pero el handshake TLS se
  corta. Todo, credenciales incluidas, viaja en claro. Es un pendiente de infraestructura.
- **La API no autentica.** La identidad es un `id_usuario` entero que manda el cliente.
- **Backend y base de datos se editan directo en producción.** No hay staging.
- **Existe una app móvil que consume los mismos endpoints.** Cambiar un contrato la rompe
  sin que este repo se entere.
