# 09 · Auditoría del trabajo posterior a la fase 1

**Fecha:** 2026-09-02 · **Alcance:** todo lo hecho desde `cb36d75` (fin de la verificación
de fase 1) hasta `efc6671`.

> Por qué existe: el trabajo posterior a los incrementos —seguridad, sistema de diseño,
> esqueletos de carga, manejo de errores, pestañas, paginación, retirada de cinco librerías—
> se hizo pantalla a pantalla y sin la disciplina de "incremento con criterio de terminado".
> Esta auditoría lo mide contra [`../ESTANDAR-DE-INGENIERIA.md`](../ESTANDAR-DE-INGENIERIA.md)
> en vez de darlo por bueno.

## Qué se midió

19 archivos nuevos y 187 tocados.

| Compromiso | Cómo se comprobó | Resultado |
|---|---|---|
| Ningún archivo pasa de 1 000 líneas | `wc -l` sobre todo `src` | **0 archivos**; el mayor de los nuevos tiene 251, casi todo JSDoc |
| Las dependencias apuntan en una sola dirección | `boundaries/dependencies` | **la regla no comprobaba nada** → ver abajo |
| Lo que se repite tres veces se extrae | Revisión de los módulos nuevos | `usePaginacion` salió de 14 copias; la cola de avisos duplicaba zustand → corregido |
| La interfaz se comporta igual | Colores literales fuera de tokens | **1 293 → 154** (−88 %); **0** en los archivos nuevos |
| Un fallo se contiene donde ocurre | `ErrorBoundary` dentro del layout, con `clave={pathname}` | correcto: la navegación sobrevive |
| DIP: nada de `fetch` fuera de la capa de API | `grep "fetch("` en los archivos nuevos | **0** |
| OCP: sin cadenas de `if` sobre el mismo valor | `grep "else if"` en los archivos nuevos | **0**; los casos van por tabla (`ICONOS`, `GRUPOS_ARCHIVO`, `TIPOS_PERMITIDOS`) |
| Estado: no copiar datos de servidor a `useState` | `useEffect` que solo hacen `setState` | **0**; ningún archivo nuevo tiene `useEffect` |
| Todo lo exportado, documentado | `jsdoc/require-*` como **error** en la zona refactorizada | lint en **0 errores** |

## Los cuatro hallazgos, y qué se hizo

### 1 · El linter de fronteras no vigilaba nada

**El más grave, porque era invisible.** `boundaries/dependencies` reportaba cero
violaciones, y yo lo había dado por bueno en la verificación de fase 1. Dos fallos
encima:

- **El resolvedor solo buscaba `.js`.** Un `import ... from "./Algo"` que apunta a un
  `.jsx` no se resolvía, y **lo que no se resuelve no se comprueba**. En una app de React,
  eso es casi todos los imports entre capas: la regla era ciega justo donde está el riesgo.
- **Era `warn`.** El propio estándar dice que una regla que depende de que alguien se
  acuerde no es una regla.

Se comprobó con un archivo que viola la frontera a propósito (`shared` importando de
`features`): sin extensión no disparaba; con `.jsx` sí. Arreglado el resolvedor y subido a
`error`, la arquitectura resulta estar **limpia de verdad**: una sola violación en todo
`src`, y es una prueba montando el árbol de la app.

**La lección, que vale para cualquier proyecto:** *una regla automática hay que verla
fallar antes de confiar en ella.* Un linter en verde puede significar "no hay problemas" o
"no estoy mirando", y desde fuera se ven igual.

### 2 · La cola de avisos duplicaba un mecanismo que ya existía

`cola.js` implementaba a mano un store externo —`Set` de oyentes, instantánea estable para
`useSyncExternalStore`— cuando el proyecto ya tiene tres stores de zustand. Dos mecanismos
para el mismo trabajo.

No había razón técnica: zustand se lee y se escribe fuera de React con `getState`, que es
justo lo que `notify` necesita para poder llamarse desde un `catch`. Migrado, con la
interfaz pública intacta y las 24 pruebas pasando sin tocarse.

### 3 · Código de seguridad sin pruebas

`shared/security/seleccion.js` —el que valida los archivos que la persona elige— era el
único módulo de seguridad sin una sola prueba. Añadidas **12**, incluida la que importa: un
ejecutable renombrado a `.pdf` no pasa.

### 4 · La decisión 0010 prometía un cerco que el diseño no sostiene

El documento decía que el cerco de `no-restricted-imports` se extendería a `Chip`, `Dialog`,
`Button`, `TextField` y `Select`. Al medirlo: **para cuatro de los cinco no existe
componente compartido**, solo tokens `sx`. Prohibir un import sin tener a dónde mandar a
quien lo necesita no crea una regla, crea un `eslint-disable` por archivo.

Corregido el documento con la regla real —*el cerco se pone donde hay componente; donde
solo hay tokens, se aplica el token*— y con lo que haría falta para extenderlo.

## Lo que queda abierto, a propósito

- **51 `fetch(` fuera de `shared/api`** en pantallas todavía sin refactorizar. Son
  anteriores a este trabajo; se corrigen cuando cada pantalla entre en su incremento.
- **154 colores literales**, casi todos paletas categóricas —mapas, gráficas, tintes— que
  se dejaron fuera de los tokens a propósito porque ahí el color es información.
- **Extender el cerco a `Select`** (tres archivos) en cuanto se compruebe que
  `SelectorBusqueda` cubre los tres usos.

## Veredicto

El trabajo extra cumple el estándar. Los dos incumplimientos reales —la regla de fronteras
ciega y el store duplicado— están corregidos, y el tercero era una promesa en un documento,
no en el código.

Lo que esta auditoría cambia de verdad no es el código: es que **la regla que sostiene el
compromiso más importante ahora falla cuando se viola**, en lugar de pasar en silencio.
