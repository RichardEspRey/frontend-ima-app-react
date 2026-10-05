# entities/session

El inicio de sesión contra `Auth.php`.

## Contenido

- `api/auth.js` — `iniciarSesion`
- `model/credenciales.js` — `validarCredenciales`

Pruebas: `credenciales.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `Auth.php` | `new_login` | `iniciarSesion()` |

## Reglas de negocio

- La API responde lo mismo si el usuario no existe o si la contraseña está mal: es lo correcto, para no revelar qué usuarios existen.
- Se valida que estén los dos campos antes de pedirle nada al servidor.

## Quién lo usa

`pages/login`
