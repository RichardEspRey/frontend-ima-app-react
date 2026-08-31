# Usuarios, sesiones, roles y permisos

## Lo que hay hoy

**Login**: `Login.jsx` hace `POST Auth.php` con `op=new_login` y recibe
`{id, name, type, user}`. Eso se guarda en `useAuthStore` (zustand) y se persiste completo
en `localStorage` bajo `auth-storage`.

**Identidad en cada petición**: no hay. Los endpoints reciben `id_usuario` como un entero
que manda el cliente. No hay cookie, ni sesión, ni token.

**Permisos**: dos sistemas encimados.

1. `menuConfig.rolesPermitidos` — arreglos de strings que mezclan roles con **nombres de
   personas**: `["admin", "Angeles", "Blanca", "Candy", "Mia"]`, `["admin", "dev", …]`.
2. `features.php` — feature flags por usuario, 39 `featureKey`, con UI de administración
   en `AccessManager.jsx`. Este es el sistema bueno.

`checkAccess(sectionName, menuConfigTree, featureKey)` prueba el feature flag y, si no
existe, cae al arreglo de nombres. Y aparte hay **57 comparaciones literales** de
`"admin"` sueltas por los componentes.

## Los tres problemas, separados

Conviene no mezclarlos porque se arreglan en fases distintas:

| Problema | Qué es | Dónde se arregla |
|---|---|---|
| **Autenticación** | Probar *quién eres*. Hoy no existe: mandas un entero. | Fase 2 (backend) |
| **Autorización** | Qué puedes hacer una vez identificado. Hoy: dos sistemas encimados. | **Fase 1 (front) + fase 3 (BD)** |
| **Nomenclatura** | `Admin` / `Administrador` / `admin` / nombres propios. | **Fase 1 (front) + fase 3 (BD)** |

Lo importante: **la autorización en el frontend nunca es seguridad.** Esconder un botón
no impide un `curl`. Lo que se construye en la fase 1 es *experiencia de usuario
consistente* + *el punto único donde después se enchufa la seguridad real*. Está dicho
explícitamente para que no se venda como lo que no es.

## Por qué NO un servicio externo (Auth0, Clerk, Firebase Auth)

Lo consideré y la respuesta sigue siendo no, por tres razones concretas:

1. **El cuello de botella es el backend, no el front.** Un IdP externo emite un JWT, pero
   alguien tiene que **verificarlo en cada uno de los 36 endpoints PHP**. Ese trabajo hay
   que hacerlo igual, con o sin Auth0. Y si hay que hacerlo igual, emitir el token desde
   `Auth.php` cuesta prácticamente lo mismo y no agrega proveedor, ni costo, ni
   dependencia de red en el login.
2. **Rompería la app móvil.** Consume los mismos endpoints. Migrar la identidad a un IdP
   obliga a migrar la móvil el mismo día. Fase 2, coordinado, no ahora.
3. **No hay caso de uso que lo justifique.** No hay registro público, ni login social, ni
   SSO corporativo, ni multi-tenant. Son decenas de usuarios internos con usuario y
   contraseña. Un IdP resolvería problemas que IMA no tiene y cobraría por ello.

Lo que **sí** vale la pena de un IdP y se puede tener sin él: expiración de sesión,
refresh, revocación (cerrar sesión de verdad desde el admin), hash fuerte de contraseñas
y bitácora de accesos. Todo eso es una tabla `sessions` y unas líneas de PHP en la fase 2.

## Diseño destino

### 1. Catálogo canónico de roles (en código)

```js
// shared/auth/roles.js
export const ROLES = {
  ADMIN:        'admin',
  DISPATCHER:   'dispatcher',
  FINANCE:      'finance',
  MAINTENANCE:  'maintenance',
  SAFETY:       'safety',
  PAYROLL:      'payroll',
  DRIVER:       'driver',
  VIEWER:       'viewer',
}
```

> Estos nombres son una **propuesta**. Se cierran cuando pases el esquema de
> `Users_credentials` y sepamos qué valores existen de verdad en producción.

### 2. Normalizador — homogeneiza sin tocar la base de datos

```js
// shared/auth/normalizeRole.js
const ALIAS = {
  'admin': ROLES.ADMIN,
  'administrador': ROLES.ADMIN,
  'administrator': ROLES.ADMIN,
  'dev': ROLES.ADMIN,
  // los nombres propios que hoy están en menuConfig se mapean uno por uno
  'angeles': ROLES.DISPATCHER,
  'blanca':  ROLES.FINANCE,
  // …
}

export const normalizeRole = (raw) =>
  ALIAS[String(raw ?? '').trim().toLowerCase()] ?? ROLES.VIEWER
```

Es exactamente el mismo patrón que ya usaste en el backend con `normalizarSubcategoria`,
y funciona por lo mismo: **desacopla la limpieza de la migración**. La app queda
homogénea hoy sin un flag day en producción; cuando la fase 3 migre los datos, el
normalizador se queda como camino de lectura hasta que ya no aplique a nada y entonces se
borra. Sin ventana de riesgo.

Ojo con el default: cae a `VIEWER`, el rol de menos privilegio. Un rol desconocido **no**
debe abrir puertas.

### 3. Permisos = rol + excepciones por usuario

Se conserva el sistema de feature flags porque ya funciona, ya es granular por usuario y
ya tiene UI. Lo que falta es la capa de rol encima, para no configurar 39 checkboxes cada
vez que entra alguien nuevo:

```
permisos_efectivos = permisos_por_defecto_del_rol  ∪/∖  overrides_del_usuario
```

- El **rol** da el paquete de arranque (un dispatcher ya nace con lo de viajes).
- Los **overrides** de `features.php` conceden o quitan casos puntuales.
- Nomenclatura de permiso: `modulo.accion` — `gastos.ver`, `gastos.crear`,
  `gastos.borrar`, `viajes.editar`. Los 39 `featureKey` actuales se mapean a esta forma.

### 4. Una sola API para los componentes

Se retira `checkAccess(sectionName, tree, featureKey)` y todas las comparaciones
`user.tipo_usuario === 'admin'`. Queda:

```jsx
const { can } = usePermissions()
if (can('gastos.borrar')) { … }

<Can permission="gastos.borrar">
  <BotonBorrar />
</Can>

// en el router
<Route element={<RequirePermission permission="gastos.ver" />}>
  <Route path="/admin-gastos" element={<AdminGastos />} />
</Route>
```

El menú se genera desde el mismo catálogo de permisos, así que un ítem visible siempre
corresponde a una ruta accesible. Hoy son dos listas que se pueden desincronizar.

### 5. Sesión

```
shared/auth/
  SessionProvider.jsx    monta la sesión, revalida permisos al arrancar
  useSession.js          { user, role, isAuthenticated, login, logout }
  usePermissions.js      { can, canAny, canAll, permissions }
  roles.js  permissions.js  normalizeRole.js
  authService.js         ← el ÚNICO archivo que sabe cómo se obtiene la identidad
```

`authService` es la costura deliberada. Hoy adentro dice "manda `id_usuario` en el
FormData". El día que la fase 2 emita un token, dice "manda `Authorization: Bearer …`".
Un archivo. Nada más se entera.

Mejoras que sí se pueden hacer en fase 1, sin tocar backend:

- **Caducidad local de sesión**: guardar `loggedInAt` y forzar re-login pasado un plazo.
  No es seguridad server-side, pero cierra el caso de la laptop compartida abierta.
- **Persistir menos**: hoy va el objeto de usuario entero a `localStorage`. Que vaya solo
  lo mínimo; los permisos se revalidan contra `features.php` al arrancar (que además
  arregla un bug real de hoy: si le quitas un permiso a alguien, lo conserva hasta que
  cierre sesión).
- **Un solo punto de logout** que limpie zustand, la caché de react-query y el token push.

## Fase 3 — base de datos (para cuando lleguemos)

```sql
roles              (id, key, nombre, descripcion)
permissions        (id, key, modulo, accion, descripcion)
role_permissions   (role_id, permission_id)
user_roles         (user_id, role_id)          -- permite más de un rol por usuario
user_permissions   (user_id, permission_id, allow)  -- overrides; sustituye features
```

Migración con la red puesta: se crean las tablas, se llenan desde el mapa de
`normalizeRole`, se verifica que los permisos efectivos calculados coincidan con los de
hoy para **todos** los usuarios, y solo entonces `Users_credentials.type` deja de ser la
fuente de verdad. Sin ventana de corte.

Recordatorio de operación: en phpMyAdmin de GoDaddy no hay transacciones entre envíos, así
que el SQL destructivo va en pasos separados con tabla de respaldo.

## Lo que hace falta para cerrar esto

Pásame el esquema de `Users_credentials` y, si existe, cualquier tabla de roles o permisos,
más el resultado de:

```sql
SELECT type, COUNT(*) FROM Users_credentials GROUP BY type;
```

Con eso el catálogo de roles y el mapa de alias dejan de ser propuesta y quedan cerrados.
