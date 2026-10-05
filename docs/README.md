# Documentación de IMA Desktop

Aplicación de escritorio (Electron + React + Vite) para la operación de IMA Express:
viajes, gastos, mantenimientos, finanzas, nómina, safety y seguimiento de unidades.

## Por dónde empezar

| Si eres… | Lee |
|---|---|
| Alguien nuevo en el proyecto | `ONBOARDING.md` → `ARQUITECTURA.md` → `GLOSARIO.md` |
| Quien va a construir una pantalla o un componente | **`CREAR-UNA-PANTALLA.md`** |
| Quien va a escribir código | `ESTANDAR-DE-INGENIERIA.md` → `CONTRIBUYENDO.md` |
| Quien va a tocar la API | `API-ENDPOINTS.md` y `backend/` |
| Quien necesita saber de roles o permisos | `ROLES-Y-PERMISOS.md` |
| Quien retoma el refactor | `refactor/00-ESTADO.md` → `refactor/PENDIENTES.md` |
| Quien pregunta "¿por qué se hizo así?" | `DECISIONES/` |

## Índice

```
docs/
  README.md              Este archivo
  ONBOARDING.md          De cero a la app corriendo
  ARQUITECTURA.md        La estructura como está hoy, sus reglas y lo que falta migrar
  CREAR-UNA-PANTALLA.md  La receta para construir algo nuevo: archivos, orden, patrones
  ESTANDAR-DE-INGENIERIA.md
                         Los principios y su criterio de aceptación. Portátil:
                         está escrito para aplicarse a cualquier proyecto
  CONTRIBUYENDO.md       Convenciones de trabajo de ESTE repositorio
  GLOSARIO.md            El vocabulario del negocio y dónde vive en el código
  API-ENDPOINTS.md       Catálogo de la API PHP
  ROLES-Y-PERMISOS.md    Roles, permisos y su migración
  backend/               PHP escrito desde este repo; la copia viva está en producción
  sql/                   Migraciones. Las de caja_estatus (001–003) y la de
                         mantenimiento (004) ya se corrieron en producción;
                         001-roles-y-permisos sigue propuesta
  MODULOS/               Un archivo por módulo funcional
                         nomina.md · el módulo de referencia del refactor
  DECISIONES/            ADRs: por qué se decidió cada cosa
  api/                   Referencia generada desde JSDoc — NO editar a mano
  refactor/              Plan del refactor en curso; PENDIENTES.md tiene la deuda medida
```

Cada carpeta de `src/entities/` y `src/features/` tiene su propio `README.md`: qué modela,
qué endpoints consume, sus reglas de negocio y quién la usa.

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
npm run estandar:medir # Mide la deuda contra el estándar
npm run dist         # Empaqueta la app de escritorio
```

## Advertencias operativas

- **La API no tiene HTTPS funcional.** El puerto 443 acepta TCP pero el handshake TLS se
  corta. Todo, credenciales incluidas, viaja en claro. Es un pendiente de infraestructura.
- **La API no autentica.** La identidad es un `id_usuario` entero que manda el cliente.
- **Backend y base de datos se editan directo en producción.** No hay staging.
- **Existe una app móvil que consume los mismos endpoints.** Cambiar un contrato la rompe
  sin que este repo se entere.
