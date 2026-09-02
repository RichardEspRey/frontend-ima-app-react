# Verificación de la fase 1

Lo que se comprobó antes de plantear el merge a `main`, con fecha y resultado. No es una
lista de buenas intenciones: cada línea se ejecutó.

**Fecha:** 2026-09-01 · **Rama:** `refactor-fase-1` · **Base:** `Emiliano` (0 commits sin integrar)

## Automático

| Comprobación | Comando | Resultado |
|---|---|---|
| Pruebas | `npm test` | **680 en verde**, 45 archivos |
| Compilación | `npm run build` | limpia |
| Lint | `npm run lint` | **0 errores**, 127 avisos |
| Arranque real de Electron | `npm run humo:electron` | pasa las 6 comprobaciones |
| Divergencia | `npm run refactor:estado` | sano: 0 commits sin integrar, 1 día |

El humo de Electron es el que más vale: lanza la aplicación empaquetada de verdad y
comprueba que React pinta, que el preload expone `window.electron`, que **Node no llega al
renderer** y que la CSP no bloquea nada. Termina en la pantalla de login.

## Cobertura de rutas

Las **45 rutas vivas** del router están en `src/test/rutas.smoke.test.jsx`, que monta cada
una con el layout y los providers reales. Es lo que atrapa un import roto tras un
movimiento, que es justo lo que el `build` no ve: el build valida que el import resuelva, no
que el componente monte.

## Recorrido en el navegador

Con datos reales de producción, sin errores en consola:

- Inicio, Mapa (centro de comando), Reports
- IMA Manager: documentos, conductores, camiones, cajas
- Gastos: Expense Manager, gastos de viaje, diesel, y sus editores
- Mantenimientos: órdenes, inventario, afinaciones, autonomía, inspecciones
- Viajes: administrador, cotizador, crear, editar, resumen
- Safety e IFTA
- Finanzas: nómina, pagos a conductores, margen

## Estado de la estructura

| Capa | Archivos | Líneas |
|---|---:|---:|
| `entities/` | 126 | 13 057 |
| `features/` | 56 | 10 541 |
| `pages/` | 47 | 10 434 |
| `shared/` | 34 | 2 676 |
| `app/` | 2 | 44 |
| sin migrar (`components`, `hooks`, `utils`, `store`…) | | 10 054 |
| cuarentena (`no-usadas/`) | | 6 788 |

**Ningún archivo pasa de 1 000 líneas.** El más grande es
`pages/gastos/EditarGastoGeneralPage.jsx`, con 736.

Invariantes que se comprueban solos:

- `src/screens/` ya no existe.
- `src/styles/` ya no existe.
- No queda ningún puente `@deprecated` fuera de la cuarentena.
- Los avisos de JSDoc que quedan están **todos** en código sin migrar: en `entities`,
  `features`, `pages` y `shared` no hay ninguno.

## Lo que la fase 1 NO arregla, y hay que tener presente al mergear

Son cosas de infraestructura o de backend. Están documentadas donde corresponde:

1. **La API no tiene HTTPS.** El puerto 443 acepta TCP pero el handshake TLS se corta;
   probado 5 de 5, en TLS 1.2 y 1.3. Ver `docs/DECISIONES/`.
2. **La API no autentica.** La identidad es un `id_usuario` que manda el cliente.
3. **`features.php · get_users` devuelve las contraseñas en claro**, sin autenticar.
4. **`Tracking.php` tarda ~21 segundos.** Se le dio su propio margen de 45 s.
5. **La tabla de requisitos de cajas no tiene `oculto_en_tabla`**, así que esa preferencia
   no se puede guardar. La pantalla lo dice en vez de fingir.
6. **Lecturas imposibles en producción**: la unidad 5 con 850 galones en un tanque de 270,
   la 7 con −33. La pantalla las marca.
7. **158 documentos de conductores con `fecha_vencimiento` en `0000-00-00`.**

## Decisiones de negocio que quedaron a la vista y sin tocar

- `canViewDeficit` se calcula en `StageDetailRow` y `TripFinanceRow` y **no se aplica**: la
  columna de déficit se le enseña hoy a todo el mundo.
- `TripAdmin` concede admin con `user?.name === 'Blanca'`, y la edición sin restricciones
  va por una lista de nombres —`Blanca`, `Angelica`, `Israel`, `Richard`— en vez de por un
  permiso.
- Las ocho pantallas de `src/no-usadas/`: si en unos meses nadie las echa de menos, se
  borran.

## Cómo repetir esta verificación

```bash
npm test && npm run build && npm run lint && npm run humo:electron && npm run refactor:estado
```
