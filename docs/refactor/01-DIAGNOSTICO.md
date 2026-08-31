# Diagnóstico — medición del 2026-08-30

Todo lo de aquí está medido sobre el árbol de trabajo, no estimado.

## Tamaño

- 204 archivos `.js` / `.jsx`, **39 745 líneas**.
- 10 archivos pasan de 600 líneas; el mayor es `screens/Viajes/TripAdmin.jsx` con **1 341**.

| Líneas | Archivo |
|---:|---|
| 1341 | `screens/Viajes/TripAdmin.jsx` |
| 1043 | `screens/Viajes/Cotizacion.jsx` |
| 1016 | `components/BorderCrossingFormNew.jsx` |
| 1008 | `components/TripForm.jsx` |
| 987 | `components/BorderCrossingForm.jsx` |
| 916 | `screens/Mapas/Tracking.jsx` |
| 749 | `components/TripFormNew.jsx` |
| 727 | `screens/Gastos/ExpenseEdit.jsx` |
| 648 | `components/InspectionModal.jsx` |
| 618 | `screens/Gastos/AdminGastos.jsx` |

## Estructura actual

```
src/
  auth/          AuthContext.jsx — código muerto, nadie lo importa
  components/    ~100 archivos planos, sin agrupar
  config/        menuConfig.js
  constants/     finances.js (un archivo)
  core/          vacía (solo .DS_Store)
  hooks/         14 hooks useFetchX casi idénticos entre sí
  layouts/       DashboardLayout.jsx
  navigation/    AppRouter.jsx — 70 imports estáticos, sin lazy loading
  redux/         menuSlice.jsx — vestigio; solo lo usa AppRouter
  screens/       mezcla de archivos sueltos y subcarpetas por módulo
  services/      printService.js (un archivo)
  store/         5 stores de zustand
  styles/ utils/
```

Los problemas de fondo, en orden de impacto:

### 1. No hay capa de acceso a datos
- **94 de 204 archivos** llaman `fetch()` directo.
- **101 usos** de `import.meta.env.VITE_API_HOST` repartidos por toda la app.
- **36 endpoints PHP** distintos referenciados desde componentes.
- **68 archivos** repiten a mano el ciclo `setLoading(true)` → `try/catch` → `setLoading(false)`.

Consecuencia: no hay caché, no hay deduplicación de peticiones, no hay reintentos, no hay
timeout, y el manejo de errores es distinto en cada pantalla. Cada navegación vuelve a
pedir todo. Cambiar la forma de hablar con la API significa editar 94 archivos.

### 2. Los roles son nombres de personas
`config/menuConfig.js` mezcla roles con nombres propios:

```js
rolesPermitidos: ["admin", "Angeles", "Blanca", "Candy", "Mia"]
rolesPermitidos: ["admin", "dev", "Angeles", "Candy"]
```

Conviven **dos sistemas de permisos** a la vez: estos `rolesPermitidos` y un sistema de
feature flags por usuario (`features.php`, 39 `featureKey`). `useAuthStore.checkAccess`
recibe tres argumentos y prueba primero uno y luego el otro.

Además hay **57 comparaciones literales** de rol (`"admin"` / `'admin'`) desperdigadas
por los componentes, más `'driver'`, `'user'`, `'operador'` y un `'administrador'` suelto
— exactamente el problema de homogeneización que hay que cerrar.

### 3. Duplicación grande y viva
- `BorderCrossingForm.jsx` (987) + `BorderCrossingFormNew.jsx` (1016) + `BorderCrossingFormNew2.jsx` (358)
- `TripForm.jsx` (1008) + `TripFormNew.jsx` (749)

≈ 4 100 líneas, las cinco en uso. Un cambio de negocio hay que aplicarlo tres veces.

### 4. Prop drilling
Componentes que reciben más de 6 props sueltas:

| Props | Componente |
|---:|---|
| 15 | `components/trip-form/GeneralTripInfoComplete.jsx` |
| 14 | `components/trip-form/StageCard.jsx` |
| 10 | `components/trip-form/GeneralTripInfo.jsx` |
| 8 | `components/TripFormNew.jsx` |
| 8 | `components/BorderCrossingFormNew.jsx` |

### 5. Arranque
`AppRouter.jsx` importa las ~70 pantallas de forma estática. Todo el bundle se carga
antes de pintar el login.

## Seguridad (alcance frontend)

| Hallazgo | Gravedad | Nota |
|---|---|---|
| Toda la API viaja por `http://` y **no hay HTTPS disponible** | **Crítica** | El puerto 443 acepta TCP pero el handshake TLS se corta (reset tras el Server hello, con TLS 1.2 y 1.3, 5 de 5 intentos). Usuario y contraseña viajan en claro y **no se puede arreglar desde el front**: hay que instalar/reparar el certificado en el hosting. |
| `features.php` · `op=get_users` devuelve **las contraseñas en claro de todos los usuarios**, sin autenticación | **Crítica** | Verificado el 2026-08-31 con un `curl` sin credenciales: responde `{"pass":"…"}` por cada usuario. Sumado a que no hay HTTPS, las credenciales quedan expuestas en tránsito y a través de un endpoint abierto. Se arregla en el backend. |
| La API no autentica | Alta | La identidad es un `id_usuario` entero que manda el cliente. Es de diseño en toda la API; se arregla en fase 2, no en el front. |
| `BrowserWindow` sin `webPreferences` explícitas | Media | Electron 35 trae `contextIsolation: true` y `nodeIntegration: false` por defecto, así que hoy no hay agujero, pero depende de un default. Falta además `setWindowOpenHandler` y guarda de `will-navigate`. |
| `localStorage` guarda el objeto de usuario completo sin caducidad | Media | La sesión no expira nunca. |
| XSS por `dangerouslySetInnerHTML` / `innerHTML` / `eval` | **Ninguno** | 0 ocurrencias. |
| Secretos en el bundle (`VITE_*`) | **Ninguno** | Solo `VITE_API_HOST`. |

## Git

- `origin/main` == `origin/Richard` (2026-08-22). Richard mergea a main.
- `Emiliano` va 18 commits adelante y 1 atrás de `origin/main`.
- Rama `refactor` (abril 2026, abandonada): **116 commits de divergencia**. Llegó a migrar
  a Feature-Sliced Design (`src/pages`, `src/features`, `src/core/ui` aparecen en su
  historia) y murió porque reintegrarla dejó de ser pagable. Bloquea el namespace
  `refactor/…` en git; por eso las ramas nuevas usan guion.
- Últimos 6 meses: Emiliano 117 commits, Richard 62.

### Mapa de calor por desarrollador (últimos 6 meses)

Directorios que **Richard** toca, de más a menos — este es el orden de riesgo de conflicto:

| Toques | Directorio |
|---:|---|
| 22 | `src/components` |
| 17 | `src/screens` (raíz) |
| 13 | `src/screens/Viajes` |
| 7 | `src/screens/Gastos` |
| 7 | `src/navigation` |
| 6 | `src/screens/Safety` |
| 5 | `src/config` |
| 4 | `src/store`, `src/screens/Dispatch`, `src/hooks/Edit_Trips_complete` |
| 3 | `src/screens/Mapas` |
| 1 | `src/screens/Mantenimientos`, `src/screens/Finanzas` |
| 0 | `src/screens/Nomina`, `AccessManager`, `Reports`, `ImaManager` |

Esto ordena los incrementos: se empieza por lo que él no toca.
