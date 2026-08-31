# Roles y permisos de IMA

> **Documento de consulta.** Si estás a media tarea y necesitas saber qué se decidió sobre
> roles, permisos o la migración, es aquí. El plan del refactor vive en `refactor/`; esto
> es el modelo en sí.
>
> Última revisión: 2026-08-31 · Implementado en `src/shared/auth/`

## Lo primero

**Los permisos del frontend no son seguridad.** Esconder un botón no impide un `curl`. La
API de IMA no autentica: la identidad es un `id_usuario` entero que manda el cliente, así
que quien quiera saltarse esto puede. Lo que hay aquí es **consistencia de experiencia** y
**el punto único donde la fase 2 enchufará la autorización real**. Decir otra cosa sería
vender humo.

## De dónde salen los roles

De los datos, no de una idea. Al 2026-08-31, `Users_credentials.type` tiene tres valores:

| `type` | Usuarios | Qué es |
|---|---:|---|
| `Admin` | 3 | Acceso total |
| `Administrativo` | 12 | Personal de oficina; acceso acotado por feature flags |
| `Driver` | 16 | Conductores. **Solo usan la app móvil**, no la de escritorio |

Nunca existió un `Administrador` con R. `Admin` y `Administrativo` **no** son el mismo rol
mal escrito: hoy se comportan distinto y así se quedan.

### El hallazgo que simplificó todo

`config/menuConfig.js` tenía `rolesPermitidos` con **nombres de personas** — `Angeles`,
`Blanca`, `Candy`, `Mia` — y un `dev`. La comparación era exacta, sin normalizar
mayúsculas:

```js
item.rolesPermitidos?.includes(user.tipo_usuario)   // "Administrativo" vs ["admin","Angeles",…]
```

Ninguno de esos nombres es un valor de `type`, así que **no podían coincidir con nadie**.
Para los 12 `Administrativo` y los 16 `Driver` ese árbol **siempre negaba**: su acceso ya
venía al 100 % de los feature flags. Eran código muerto — 38 arreglos, 48 apariciones — y
se eliminaron en el incremento 4 sin cambiarle el acceso a nadie.

Lo mismo con `useAuthStore.checkAccess`: no tenía un solo llamador.

## Cómo se calcula el acceso

```
permisos efectivos = paquete del rol  ∪/∖  ajustes del usuario
```

1. El **rol** da el paquete de arranque, para no palomear 38 casillas por cada persona nueva.
2. Los **ajustes por usuario** (los feature flags de `features.php`) mandan encima. Un flag
   en `true` concede algo que el rol no traía; uno en `false` **quita** algo que sí traía.
   Un `false` es una negación explícita, no una ausencia.
3. Un **rol total** — hoy solo Administrador — ve todo sin pasar por lo anterior. Ni
   siquiera un flag en `false` puede quitarle nada.

Ese orden es lo que permite migrar sin sustos: mientras existan los ajustes por usuario,
cambiar el paquete de un rol no le quita nada a quien ya lo tuviera concedido a mano.

## Catálogo de roles

| Rol | Clave | Permisos de fábrica |
|---|---|---:|
| Administrador | `administrador` | 38 de 38 |
| Operaciones | `operaciones` | 21 de 38 |
| Finanzas | `finanzas` | 16 de 38 |
| Mantenimiento | `mantenimiento` | 14 de 38 |
| Safety | `safety` | 9 de 38 |
| Administrativo | `administrativo` | 1 de 38 |
| Consulta | `consulta` | 1 de 38 |
| Operador | `operador` | 0 de 38 |

`Administrativo` tiene el paquete mínimo **a propósito**: es el destino de transición del
`Administrativo` actual mientras no se decida en qué área cae cada persona. Nadie pierde
accesos, porque sus flags individuales siguen mandando.

`Operador` no trae nada de escritorio porque los conductores usan la app móvil.

`Consulta` es el destino de un `type` desconocido. Un rol que nadie reconoce **no debe
abrir puertas**: cae al de menor privilegio, nunca al mayor.

## Matriz de permisos

Generada desde `src/shared/auth/roles.js`. Si cambia el paquete de un rol, se cambia ahí y
se vuelve a generar — hay un test que impide que el SQL y el frontend discrepen.

| Permiso | Admin | Oper | Fin | Mant | Safety | Advo | Cons | Opdor |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **general** | | | | | | | | |
| `inicio` | ● | ● | ● | ● | ● | ● | ● | · |
| `mapa` | ● | ● | ● | ● | ● | · | · | · |
| `reports` | ● | ● | ● | ● | ● | · | · | · |
| **imaManager** | | | | | | | | |
| `ima_manager` | ● | ● | · | ● | ● | · | · | · |
| `ima_documentos` | ● | ● | · | · | ● | · | · | · |
| `ima_conductores` | ● | ● | · | · | ● | · | · | · |
| `ima_camiones` | ● | ● | · | ● | · | · | · | · |
| `ima_cajas` | ● | ● | · | ● | · | · | · | · |
| **gastos** | | | | | | | | |
| `gastos` | ● | ● | ● | ● | · | · | · | · |
| `gastos_nuevo` | ● | · | ● | · | · | · | · | · |
| `gastos_admin_general` | ● | · | ● | · | · | · | · | · |
| `gastos_diesel` | ● | · | ● | ● | · | · | · | · |
| `gastos_viajes` | ● | ● | ● | · | · | · | · | · |
| **mantenimientos** | | | | | | | | |
| `mantenimientos` | ● | · | · | ● | · | · | · | · |
| `mant_inspeccion_final` | ● | · | · | ● | · | · | · | · |
| `mant_ordenes_servicio` | ● | · | · | ● | · | · | · | · |
| `mant_inventario` | ● | · | · | ● | · | · | · | · |
| `mant_autonomias` | ● | · | · | ● | · | · | · | · |
| `mant_afinaciones` | ● | · | · | ● | · | · | · | · |
| **viajes** | | | | | | | | |
| `viajes` | ● | ● | ● | · | · | · | · | · |
| `viajes_cotizador` | ● | ● | · | · | · | · | · | · |
| `viajes_crear` | ● | ● | · | · | · | · | · | · |
| `viajes_admin` | ● | ● | ● | · | · | · | · | · |
| `viajes_tab_programacion` | ● | ● | · | · | · | · | · | · |
| `viajes_tab_upcoming` | ● | ● | · | · | · | · | · | · |
| `viajes_tab_despacho` | ● | ● | · | · | · | · | · | · |
| `viajes_tab_en_ruta` | ● | ● | · | · | · | · | · | · |
| `viajes_tab_completados` | ● | ● | · | · | · | · | · | · |
| `view_all_trips` | ● | ● | · | · | · | · | · | · |
| `viajes_invoice_fields` | ● | ● | ● | · | · | · | · | · |
| **safety** | | | | | | | | |
| `safety` | ● | · | · | · | ● | · | · | · |
| `safety_general` | ● | · | · | · | ● | · | · | · |
| `safety_ifta` | ● | · | · | · | ● | · | · | · |
| **finanzas** | | | | | | | | |
| `finanzas` | ● | · | ● | · | · | · | · | · |
| `finanzas_nomina` | ● | · | ● | · | · | · | · | · |
| `finanzas_pagos` | ● | · | ● | · | · | · | · | · |
| `finanzas_ventas` | ● | · | ● | · | · | · | · | · |
| `finanzas_margen` | ● | · | ● | · | · | · | · | · |

## Cómo se usa en el código

```jsx
import { usePermisos, useSesion, Can, PERMISOS } from "../shared/auth";

// comprobar un permiso
const { can } = usePermisos();
if (can(PERMISOS.VIAJES_INVOICES)) { … }

// esconder algo
<Can permiso={PERMISOS.GASTOS_ADMIN_GENERAL}>
  <BotonBorrar />
</Can>

// el equivalente del viejo isAdmin
const { esTotal } = useSesion();
```

**Nunca** escribas la cadena del permiso a mano ni compares `tipo_usuario`. Esas dos cosas
son justamente las que se acaban de quitar de encima.

Las claves de `PERMISOS` son **exactamente** las que guarda `features.php` hoy. No se
renombraron a `modulo.accion` porque son el formato de red, y la app móvil consume los
mismos endpoints: cambiarlas la rompería en silencio. El nombre nuevo llegará con la
migración de base de datos.

**Ojo:** el valor crudo de `tipo_usuario` se sigue mandando tal cual al backend en varias
pantallas (`fd.append('user_type', …)`). Normalizar el rol es una decisión **del
frontend**; lo que viaja a la API no cambia.

## Estado de la migración

| Fase | Qué | Estado |
|---|---|---|
| 1 · Frontend | Catálogo, normalizador, `can()`, retirar comprobaciones dispersas | **hecho** (incremento 4) |
| — | Repartir los 12 `Administrativo` en roles por área | **pendiente** |
| 2 · Backend | Token de sesión real en `Auth.php` y verificarlo en los 36 endpoints | no empezada |
| 3 · Base de datos | Tablas nuevas y retirar el normalizador | SQL listo, sin correr |

`normalizarRol` es **deuda deliberada y temporal**: mapea los valores de hoy al catálogo
canónico para que la app quede consistente sin depender de que la base migre primero — en
producción no hay red de seguridad. Cuando la fase 3 migre los datos, se queda como camino
de lectura hasta que ya no aplique a nadie, y entonces se borra. Es el mismo patrón que ya
funcionó en el backend con `normalizarSubcategoria`.

### El SQL

`docs/sql/001-roles-y-permisos.sql`. **No toca nada de producción**: crea tablas nuevas que
nadie lee todavía, así que mientras nada las consulte, borrarlas no rompe nada.

Va en bloques separados porque el phpMyAdmin de GoDaddy no tiene transacciones entre
envíos, e incluye la verificación que hay que correr **antes** de que el backend empiece a
leer de ahí. Usa `UNION ALL` en vez del constructor `VALUES()`, que necesita MySQL 8.0.19+.

## Decisiones abiertas

**1. Repartir los 12 `Administrativo`.** Están todos en el rol de transición. Para
agruparlos por área hay que ver qué tienen habilitado hoy, en vez de inventarlo:

```sql
SHOW TABLES LIKE '%feature%';

SELECT u.name, u.type, GROUP_CONCAT(f.feature_key ORDER BY f.feature_key SEPARATOR ', ')
FROM Users_credentials u
JOIN <TABLA_FEATURES> f ON f.user_id = u.id AND f.enabled = 1
WHERE u.type = 'Administrativo'
GROUP BY u.id;
```

**2. El nombre cableado.** `src/screens/Viajes/TripAdmin.jsx:121`:

```js
const isAdmin = user?.tipo_usuario?.toLowerCase() === 'admin' || user?.name === 'Blanca';
```

Se dejó **intacto** a propósito: quitarlo le cambia el acceso a una persona. Lo correcto es
darle el permiso que necesita y borrar la línea.

**3. Los 16 `Driver` en escritorio.** Si de verdad no la usan, su rol se queda sin nada,
como está. `fetchPermissions` manda `app: "Desktop"`, lo que implica que existe un
`"Mobile"` cuyo comportamiento no se ve desde este repo.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `src/shared/auth/permisos.js` | Los 38 permisos y su agrupación por módulo |
| `src/shared/auth/roles.js` | Catálogo de roles, alias y `normalizarRol` |
| `src/shared/auth/permisosEfectivos.js` | El cálculo `rol ∪/∖ ajustes` |
| `src/shared/auth/SesionContext.jsx` | `SesionProvider`, `useSesion`, `usePermisos` |
| `src/shared/auth/Can.jsx` | El componente `<Can>` |
| `src/app/providers/SessionProvider.jsx` | Lo único que conoce zustand **y** `shared/auth` |
| `docs/sql/001-roles-y-permisos.sql` | La migración propuesta |
| `docs/DECISIONES/0001-sin-idp-externo.md` | Por qué no se contrató Auth0 ni Clerk |
| `docs/DECISIONES/0004-roles-normalizados-en-front.md` | Por qué se normaliza en el front |
