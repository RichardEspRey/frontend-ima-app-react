# Arquitectura

> La arquitectura **como está construida hoy** en `refactor-fase-1`. El destino y el porqué
> de cada decisión están en [`refactor/02-ARQUITECTURA.md`](refactor/02-ARQUITECTURA.md);
> los principios, en [`ESTANDAR-DE-INGENIERIA.md`](ESTANDAR-DE-INGENIERIA.md). Para
> construir algo nuevo, la receta es [`CREAR-UNA-PANTALLA.md`](CREAR-UNA-PANTALLA.md).
>
> Las cifras de este documento se midieron el 2026-10-05. `npm run estandar:medir` las
> vuelve a sacar.

---

## 1 · Qué es la aplicación

Una aplicación de escritorio **Electron + React 19 + Vite**, con MUI 7 como librería de
componentes. Habla con una API **PHP** alojada en producción (`VITE_API_HOST`) mediante
`POST` con `FormData` y un campo `op` que multiplexa las operaciones de cada archivo.

```
┌──────────────── Electron ────────────────┐
│ electron.cjs   ventana, actualizaciones  │
│ preload.js     puente mínimo y aislado   │
│ ┌──────────── renderer (React) ────────┐ │        ┌──────────────┐
│ │ app → pages → features → entities ──┼─┼──POST──▶ API PHP      │──▶ MySQL
│ │                          shared/api  │ │        │ (producción) │
│ └──────────────────────────────────────┘ │        └──────────────┘
└──────────────────────────────────────────┘                ▲
                                                 app móvil ──┘ (misma API)
```

Tres hechos del entorno que condicionan todo el diseño:

- **No hay staging.** El backend y la base se editan en vivo; el frontend local corre contra
  producción.
- **La API no autentica.** La identidad es un `id_usuario` que manda el cliente. Los permisos
  del front son experiencia de usuario, no seguridad (`DECISIONES/0006`).
- **La app móvil consume los mismos endpoints.** Cambiar un contrato la rompe.

---

## 2 · Las capas

```
src/
  app/        Arranque: providers, tema, manejadores globales de errores
  pages/      Una ruta = una pantalla. Compone; no implementa
  features/   Un caso de uso con su estado y su interfaz
  entities/   El dominio: modelo, validación y acceso a datos de un concepto
  shared/     Sin negocio: cliente de API, UI base, sesión, utilidades, seguridad
```

| Capa | Archivos (sin pruebas) | Carpetas |
|---|---|---|
| `app/` | 5 | `providers/` |
| `pages/` | 48 | 15 módulos |
| `features/` | 90 | 16 |
| `entities/` | 107 | 30 |
| `shared/` | 43 | `api`, `auth`, `config`, `lib`, `security`, `ui` |

### La regla de dependencias

```
app  →  pages  →  features  →  entities  →  shared
```

Solo hacia la derecha. **La comprueba el linter**, no la revisión de código:
`eslint-plugin-boundaries` en `eslint.config.js`, con el resolvedor configurado para `.jsx`
—sin eso la regla pasaba en verde sin comprobar nada; ver `refactor/09-AUDITORIA-EXTRA.md`—.

| Desde | Puede importar | No puede |
|---|---|---|
| `app` | todo lo de abajo | — |
| `pages` | `features`, `entities`, `shared` | otra página |
| `features` | `entities`, `shared` | **otra feature** |
| `entities` | `entities`, `shared` | `features`, `pages` |
| `shared` | `shared` | cualquier capa de negocio |

`entities → entities` se permite **a propósito**: `payroll` y `personal` comparten
vocabulario (tipo de nómina, frecuencia de pago), y duplicarlo sería peor que el
acoplamiento. Es la relajación `@x` de Feature-Sliced Design.

### Dentro de cada carpeta

```
entities/<concepto>/            features/<caso-de-uso>/
  model/    esquemas, reglas        model/   controladores (use<Algo>) y reglas del flujo
  api/      peticiones y hooks      ui/      componentes que pintan
  __tests__/                        __tests__/
  index.js  lo público              index.js
  README.md                         README.md
```

El `index.js` es la frontera: fuera de la carpeta se importa del índice, nunca de
`model/` o `api/` directamente.

---

## 3 · El camino de un dato

```
pages/X                 compone
  └─ features/x/model/useX()           controlador: estado de pantalla, acciones
       └─ entities/y/api/useY()        useQuery / useMutation, llave de caché
            └─ obtenerY({signal})       @endpoint, normaliza, avisa de descartados
                 └─ shared/api/post()   FormData + op, timeout, ApiError, cancelación
                      └─ ENDPOINTS.y    el único sitio con un ".php"
                           │
                     ◀─────┘ respuesta
            normalizarY() con zod  → lo inválido se descarta y se cuenta
       caché de TanStack Query     → una petición aunque la pidan tres componentes
  features/x/ui/*  pinta lo que le pasa el controlador
```

**De vuelta, al guardar:** el controlador llama a `mutateAsync`; la mutación invalida su
llave (o pinta antes y revierte si falla, en la actualización optimista); el error sube a
`notify.error` en el controlador.

---

## 4 · Estado

| Tipo | Herramienta | Dónde vive |
|---|---|---|
| De servidor | TanStack Query 5 | `entities/*/api`, configuración en `shared/api/queryClient.js` |
| De sesión | zustand → `SesionProvider` | `store/useAuthStore.js` lo guarda; `shared/auth` lo publica |
| Preferencias globales | zustand | `store/useSidebarStore.js` |
| Filtros que sobreviven a la navegación | zustand | `store/useGastosFiltrosStore.js`, `store/useViajesFiltrosStore.js` |
| De una pantalla | El controlador de la feature | `features/*/model/use*.js` |
| Local | `useState` | El componente |

Valores por omisión de las consultas (`crearQueryClient`): frescura de **5 minutos**,
reintento con espera exponencial hasta 8 s solo para lo que puede arreglarse solo
(`debeReintentar` decide por la **causa** del `ApiError`, no por su texto), y las
mutaciones sin reintento. Los catálogos usan `FRESCURA_CATALOGO_MS` (**30 minutos**).

**La sesión tiene dos puertas y solo una es la buena.** Las features y páginas nuevas leen
la identidad con `useSesion()` y los permisos con `usePermisos()` / `<Can>`. `useAuthStore`
queda para el login, el router y el menú, que todavía no se migran.

---

## 5 · `shared/`, pieza por pieza

| Módulo | Contiene | Lo usa quien… |
|---|---|---|
| `api/client.js` | `post`, `postLista`, `construirFormData` | Toda función de `entities/*/api` |
| `api/endpoints.js` | `ENDPOINTS`, el registro de los `.php` | `entities/*/api` |
| `api/errors.js` | `ApiError` con `CAUSA_ERROR` | El reintento, `describirError`, los avisos |
| `api/zodPhp.js` | `idPhp`, `numeroPhp`, `booleanoPhp`, `nullable`, `fechaDia` | Los esquemas de las entidades |
| `api/queryClient.js` | `crearQueryClient`, `FRESCURA_CATALOGO_MS` | `app/providers/QueryProvider` y los catálogos |
| `api/actualizar.js` | `useActualizarPantalla`: refresca las consultas activas | Las pantallas con botón de actualizar |
| `auth/` | `PERMISOS`, `ROLES`, `useSesion`, `usePermisos`, `<Can>` | Toda comprobación de identidad o permiso |
| `ui/` | `DataTable`, `PageHeader`, `Pestanas`, `Selector`, `CampoFecha`, esqueletos, `EstadoError`, `ErrorBoundary`, `notify`, tokens y estilos | Toda interfaz. Ver `shared/ui/README.md` |
| `lib/` | `formato`, `orden`, `pdf`, `terminos` | Formatos y ordenamiento sin dominio |
| `security/` | Saneado de texto, lista blanca de URLs, validación de archivos por contenido | Formularios, enlaces y subidas |
| `config/` | `env.js` (falla al arrancar si falta `VITE_API_HOST`), `mapa.js` | El cliente de API y los mapas |

---

## 6 · Composición de la aplicación

```
main.jsx
└─ App.jsx                         instalarErroresGlobales(), aviso de actualización
   └─ ThemeProvider                tema MUI desde los tokens; monta AnfitrionAvisos
      └─ QueryProvider             TanStack Query; errores de fondo → avisarDeFallo
         └─ SessionProvider        usuario y ajustes de zustand → SesionProvider
            └─ AppRouter           HashRouter; login o DashboardLayout
               └─ DashboardLayout  barra lateral, encabezado, campana
                  └─ ErrorBoundary clave={pathname}
                     └─ <Outlet />  la página de la ruta
```

### Las cuatro capas de errores, en archivos

| Capa | Archivo | Atrapa |
|---|---|---|
| 1 · Sección | `DataTable error`, `EstadoError` | Una consulta que falló; el resto de la pantalla sigue |
| 2 · Pantalla | `shared/ui/ErrorBoundary` en `layouts/DashboardLayout.jsx` | Un fallo de render; la navegación sobrevive y el error se olvida al cambiar de ruta |
| 3 · Datos | `QueryProvider` → `crearQueryClient({ alFallar: avisarDeFallo })` | Lo que ninguna pantalla pintó, con aviso discreto |
| 4 · Entorno | `app/erroresGlobales.js` | Rechazos sin `catch` y errores fuera del árbol, con silencio de 5 s por mensaje repetido |

### Electron

`electron.cjs` crea la ventana con `contextIsolation: true`, `nodeIntegration: false`,
`sandbox: true`, niega ventanas nuevas (`setWindowOpenHandler`) y bloquea la navegación
fuera de la app (`will-navigate`). `preload.js` expone solo `window.electron` con las cuatro operaciones de actualización (buscar, descargar, aviso de disponible y progreso) y bloquea el zoom con la rueda.
`npm run humo:electron` comprueba que arranque.

---

## 7 · Lo que todavía no está en su capa

La estructura vieja convive con la nueva y se va vaciando. Medido el 2026-10-05:

| Carpeta vieja | Archivos | Qué queda ahí | Destino |
|---|---|---|---|
| `components/` | 68 | Formularios de viaje (`TripFormMX`, `TripFormUSA`, `BorderCrossingFormNew2`), filas y modales de módulos viejos, `Sidebar`, `Header` | `features/` del módulo, o `shared/ui` si no tienen dominio |
| `store/` | 6 | Los cuatro stores de zustand | Se quedan: zustand es la herramienta de estado global |
| `hooks/` | 6 | Hooks de catálogo de gastos y órdenes, tipo de cambio | `entities/*/api` |
| `navigation/`, `layouts/`, `config/` | 3 | Router, layout, menú | `app/` cuando se migre el arranque |
| `constants/`, `utils/` | 5 | Constantes de finanzas y utilidades sueltas | La entidad o `shared/lib` |
| `no-usadas/` | 23 | Código congelado, fuera del lint | Se borra cuando se confirme que nadie lo necesita |

Y dentro de las capas nuevas, la deuda medida —`fetch` directo, entidades sin conectar,
archivos largos, props viejas de `Grid`— está en
[`refactor/PENDIENTES.md`](refactor/PENDIENTES.md).

### Diferencias con el destino de `refactor/02`

| El destino decía | Hoy | Por qué |
|---|---|---|
| `app/router/` | `navigation/AppRouter.jsx` | El router no se ha movido; moverlo es un `git mv` aparte |
| `React.lazy` por ruta | Importación directa de las 48 páginas | Pendiente; afecta el arranque, no la corrección |
| `react-hook-form` | No se agregó | Los formularios grandes siguen en `useState`; se evaluará al migrar los de viaje |
| `shared/hooks/` | No existe | No apareció un hook sin dominio que usaran dos módulos |
| `entities/*/ui/` | Ninguna entidad la tiene | Toda la presentación ha resultado ser de un flujo |
| Redux eliminado | **Hecho** | — |
