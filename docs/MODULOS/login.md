# Módulo: Login

La única pantalla que se ve sin sesión iniciada.

| Ruta | Archivo |
|---|---|
| `/login` | `pages/login/LoginPage.jsx` |

## Entidad

**`entities/session`** — `Auth.php` · `new_login`

- `model/credenciales.js` → `validarCredenciales({ usuario, contrasena })`, que decide si
  vale la pena siquiera mandar la petición.
- `api/auth.js` → `iniciarSesion({ usuario, contrasena, signal })`.

## Reglas de negocio

- El router decide con `user`: si no hay sesión, **cualquier ruta redirige aquí**; si la
  hay, `/login` no es alcanzable. Por eso esta pantalla no se puede revisar en el navegador
  sin cerrar sesión antes.
- Un login fallido **no deja sesión a medias**. Es la garantía que cubre la prueba
  correspondiente: el store queda intacto si la API rechaza.
- Tras un login correcto se piden los permisos del usuario antes de pintar el menú, para
  que nadie vea por un instante entradas que no le corresponden.

## Cosas que sorprenden

- **Las credenciales viajan en claro.** No es un defecto de esta pantalla: el hosting no
  tiene TLS funcional. Ver `refactor/08-DIAGNOSTICO-BD.md`.
- **La contraseña se compara en texto plano del lado del servidor.** Tampoco es de aquí; el
  procedimiento para hashearlas sin ventana de corte está en ese mismo documento.
- El único archivo del frontend que cambia cuando la fase 2 introduzca tokens de sesión es
  `shared/auth/authService`. La costura se dejó puesta a propósito.
