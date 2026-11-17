# Rendimiento — diagnóstico de llamadas, dobles y memoria

> Medido el **2026-11-17** sobre la rama `Emiliano` (`4f4b3d1`) y contra producción con
> consultas de **solo lectura**. No se cambió código ni servidor al escribirlo.
> Los pasos para arreglarlo están en `12-PLAN-SIGUIENTE.md`, parte A.

## 1 · Resumen

| # | Hallazgo | Costo hoy | Arreglo |
|---|---|---|---|
| 1 | El sondeo de inspecciones baja 168 KB cada minuto | 3 peticiones/min y ~10 MB/hora por máquina suscrita | Front: cachear el catálogo |
| 2 | El catálogo `All_CL_Final` (80 KB) se pide desde cuatro sitios sin caché | Es el 48 % del punto 1 y se repite en Sidebar y avisos | Front: un caché con vigencia |
| 3 | Sidebar pide permisos en **cada** foco de ventana | 1 petición por cada alt-tab, además del sondeo de 5 min | Front: quitarlo |
| 4 | Sidebar repite `getInspecciones` (los dos lados) que ya pide la campana | 2 peticiones y 88 KB cada 5 min | Front: compartir el resultado |
| 5 | La campana pide un `getById` por cada BL para armar la nomenclatura | Hasta 20 peticiones al abrir sesión | Front: usar el catálogo, o backend |
| 6 | Los catálogos de los formularios de viaje no se cachean | 6 peticiones cada vez que se abre un formulario | Front: caché en los hooks |
| 7 | El servidor no comprime | `getAllGastos` 1.48 MB, `All_finanzas` 758 KB | Servidor: gzip |
| 8 | `Tracking.php get_dashboard` tarda 7.7 s | Se pide cada 50 s con el mapa abierto | Servidor: caché de Wialon |
| 9 | Faltan índices en `diesel_tickets.trip_id` e `IFTA_STATE.trip_id` | Recorrido completo en cada consulta | BD: dos `CREATE INDEX` |

**Memoria:** no encontré fugas. Detalle en § 5.

## 2 · Cuánto pide una máquina en reposo

Con la app abierta, sin tocar nada, ventana a la vista. Para una persona suscrita a todo:

| Quién | Qué pide | Cada | Peticiones/min | KB/min |
|---|---|---|---:|---:|
| `DashboardLayout` | `Notifications.php getNew` | 30 s | 2.0 | ~0.2 |
| `NotificationBell` · inspecciones | `All_CL_Final` + `getInspecciones` ×2 | 60 s | 3.0 | 168 |
| `useAvisosDerivados` · viajes | `Programacion getAll` + `getPaginated` | 2 min | 1.0 | 3 |
| `useAvisosDerivados` · mantenimiento | `getSinFallas` + `getSinInspeccion` + `All_CL_Final` | 5 min | 0.6 | 25 |
| `Sidebar` | `getStatus` + `getInspecciones` ×2 | 5 min | 0.6 | 18 |
| `NotificationBell` · lista | `Notifications.php getAll` | 5 min | 0.2 | 1 |
| `NotificationBell` · suscriptores | `getSuscriptoresInspeccion` | 5 min | 0.2 | 0.1 |
| `useAvisosDerivados` · categorías | `getMisCategorias` | 5 min | 0.2 | 0.05 |
| `DashboardLayout` · permisos | `features.php get_user_features` | 5 min | 0.2 | 0.4 |
| **Total** | | | **~8** | **~215** |

Son unas 8 peticiones por minuto y unos 13 MB por hora, por máquina. Con la ventana oculta
baja a unas 4 por minuto.

> **Corrección a lo dicho el 2026-11-13.** Cuando se redujeron los sondeos se dijo «de 12
> a 2 o 3 peticiones por minuto». Esa cuenta no incluía el sondeo de inspecciones (3/min,
> solo para suscritos) y es anterior a los avisos de viajes, mantenimiento y Safety. La
> cifra real hoy, para alguien suscrito a todo, es la de esta tabla. Quien no está suscrito
> a inspecciones ni a viajes sí anda en 2 o 3.

Los avisos diarios (diesel 78 KB, Safety 110 KB) piden una vez al día; no pesan.

## 3 · Llamadas constantes y dobles, una por una

### 3.1 El sondeo de inspecciones · el más caro

`src/services/mantenimiento.js` · `obtenerAvisosDeInspecciones()` pide tres cosas en cada
vuelta, y `NotificationBell.jsx` la llama cada 60 s (120 s oculta):

| Petición | Tamaño | Tiempo |
|---|---:|---:|
| `formularios.php All_CL_Final` | 79.9 KB | 0.38 s |
| `mtto.php getInspecciones lado=camion` | 71.0 KB | 0.30 s |
| `mtto.php getInspecciones lado=caja` | 16.7 KB | 0.25 s |

`All_CL_Final` es un catálogo: solo se usa para sacar la nomenclatura de cada viaje y solo
cambia cuando nace un viaje. Pedirlo cada minuto no aporta nada.

### 3.2 El catálogo `All_CL_Final` sin caché

`obtenerInspecciones()` (el que pide `All_CL_Final`) lo llaman, cada una por su cuenta:

- `obtenerAvisosDeInspecciones` — campana, cada 60 s.
- `obtenerInspeccionesSinFallas` — avisos de mantenimiento, cada 5 min, y la pestaña Sin fallas.
- `obtenerInspeccionesDeLado` — la pantalla de Reparaciones.

En el refactor esto ya está resuelto: `useNomenclaturas` lo cachea con `staleTime`.

### 3.3 Permisos al enfocar la ventana

`src/components/Sidebar.jsx:82-91` llama a `fetchPermissions` al montar **y en cada evento
`focus` de la ventana**. `DashboardLayout.jsx` ya los sondea cada 5 min. Resultado: dos
peticiones al iniciar sesión y una más cada vez que alguien vuelve a la app desde otra
ventana, sin límite.

### 3.4 Sidebar repite lo de la campana

`Sidebar.jsx:164-180` pide cada 5 min `obtenerInspeccionesPorAtender` para camión y para
caja: son los mismos dos `getInspecciones` de § 3.1, pedidos otra vez solo para contar.

### 3.5 Un `getById` por notificación

`NotificationBell.jsx` (efecto de `nomenclaturas`) pide `new_tripsv2.php getById` por cada
`trip_id` distinto entre las notificaciones de BL, hasta 20, cada vez que se abre sesión.
Cada respuesta es un viaje completo con etapas y documentos, para leer cuatro campos.

Emiliano dejó en pausa (2026-10-28) la alternativa de backend: que `getAll`/`getNew`
manden `nomenclatura`. Ver memoria `campana-nomenclatura`. Sin backend, se puede sacar del
catálogo de § 3.2 una vez que esté en caché.

### 3.6 Catálogos de los formularios de viaje

`src/hooks/useFetchActiveDrivers`, `…Trucks`, `…Trailers`, `…ExternalTrailers`,
`useFetchCompanies` y `useFetchWarehouses` piden al montar, sin caché ni deduplicación. Los
usan nueve componentes, seis hooks cada uno (`TripForm*`, `BorderCrossingForm*`,
`EditTripForm`, `EditTripComplete`), más Gastos. Abrir, cerrar y volver a abrir un
formulario son 12 peticiones; hay 86 usos en total.

### 3.7 Lo que ya está bien

- Todos los `setInterval` se limpian al desmontar.
- `sondear` (`src/utils/sondeo.js`) no encima peticiones y baja el ritmo con la ventana oculta.
- `src/auth/AuthContext.jsx` tiene un sondeo de permisos cada 15 s, pero **nadie lo
  importa**: es código muerto. Conviene borrarlo para que nadie lo reviva.
- `EstatusCajas.jsx` refresca cada 5 min y solo con esa pantalla abierta.

## 4 · Lo que depende del servidor

Medido el 2026-11-13; nada de esto ha cambiado.

| Endpoint | Tamaño | Tiempo | Nota |
|---|---:|---:|---|
| `save_expense.php getAllGastos` | 1.48 MB | 0.56 s | Sin paginar |
| `formularios.php All_finanzas` | 758 KB | — | Ventas; sin paginar |
| `service_order.php getAllOrdersWithDetails` | 299 KB | — | |
| `IFTA.php get_ifta_trips` | 145 KB | — | |
| `safety.php get_safety_trips` | 110 KB | 0.35 s | |
| `Tracking.php get_dashboard` | — | 7.7 s | Consulta a Wialon en cada petición |

- **Sin compresión.** Ninguna respuesta lleva `Content-Encoding`. JSON repetitivo comprime
  unas 8 a 10 veces: es la mejora más barata de toda la lista (una regla en `.htaccess`).
- **Wialon en cada petición.** Con dos mapas abiertos son dos consultas a Wialon cada 50 s.
  Un caché de 30 a 60 s en el servidor las vuelve una.
- **Índices.** Ver `08-DIAGNOSTICO-BD.md` § 3 y § 5.1.

Para tocar el servidor hacen falta archivos que no están en local: `conexion.php`,
`Tracking.php`, el `.htaccess` de `/API` y el listado de esa carpeta.

## 5 · Memoria

Revisé temporizadores, escuchas, cachés en memoria y lo que se guarda en el navegador.

- **Temporizadores:** los nueve `setInterval` de `src` tienen su `clearInterval`. Los de
  `TruckScreen`, `DriverScreen`, `TrailerScreen` y `TripForm*` viven dentro de un `Swal` y
  se limpian en `willClose`.
- **Escuchas del DOM:** todos los archivos con `addEventListener` tienen el mismo número
  de `removeEventListener`.
- **Escuchas de Electron:** `preload.js` registra `ipcRenderer.on` en `onUpdateAvailable`
  y `onUpdateProgress` sin forma de quitarlos. `App.jsx` y `Sidebar.jsx` los registran una
  vez por sesión, así que no crece; solo se duplicaría si `Sidebar` se desmontara y
  volviera a montar. Riesgo bajo; el arreglo es que `preload.js` devuelva la función de baja.
- **Cachés en memoria:** `NotificationBell` guarda nomenclaturas y `trip_id` pedidos sin
  tope, pero crecen con las notificaciones (20 por consulta). Despreciable.
- **`localStorage`:** leídos y ocultos topan en 500 ids; avisos de documentos en 60 y 14 días.
- **Lo que sí pesa:** las pantallas que cargan la lista entera. Admin gastos mantiene en
  memoria 1.48 MB de JSON, más sus copias filtradas y ordenadas; Ventas, 758 KB. No es una
  fuga —se libera al salir de la pantalla—, pero es lo que hace lenta la app en máquinas
  modestas. Se arregla con paginación en el servidor (§ 4), no en el front.
- **`console.log`:** quedan 17 en `src`. Algunos imprimen respuestas completas
  (`Finanzas.jsx` imprime los 758 KB de Ventas en cada carga). Con las herramientas de
  desarrollo abiertas, la consola retiene esos objetos y no se liberan.

## 6 · Cómo volver a medir

Todo con `curl`, solo lectura, contra `https://imaexpressllc.com/API`:

```bash
curl -s -o /dev/null -w "%{size_download} bytes, %{time_total}s\n" \
  -X POST https://imaexpressllc.com/API/formularios.php -d op=All_CL_Final
```

Para contar peticiones reales: abrir la app en `localhost:5173`, pestaña Red de las
herramientas de desarrollo, filtrar por `API/` y dejarla cinco minutos sin tocar. Emiliano
inicia sesión; ver memoria `emiliano-introduce-las-credenciales`.

No usar `Notifications.php getNew` para medir: marca las notificaciones como entregadas.
