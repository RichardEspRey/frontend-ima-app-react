import { ENDPOINTS, post } from "../../../shared/api"

/**
 * Comprueba unas credenciales contra el servidor.
 *
 * La API responde `{status:'error'}` tanto si el usuario no existe como si la
 * contraseña está mal, y con el mismo mensaje. Es lo correcto: distinguirlos le
 * diría a quien prueba credenciales cuáles usuarios existen.
 *
 * @endpoint POST Auth.php · op=new_login
 * @param {object} credenciales Lo que se escribió.
 * @param {string} credenciales.usuario Usuario o correo.
 * @param {string} credenciales.contrasena Contraseña.
 * @param {AbortSignal} [credenciales.signal] Señal de cancelación.
 * @returns {Promise.<object>} Los datos de la persona que entró.
 * @throws {ApiError} Si las credenciales no son válidas o falla la red.
 */
export async function iniciarSesion({ usuario, contrasena, signal }) {
  const cuerpo = await post(
    ENDPOINTS.auth,
    "new_login",
    { usermail: usuario, password: contrasena },
    { signal },
  )

  if (!cuerpo?.user) throw new Error("El servidor no devolvió los datos del usuario.")
  return cuerpo.user
}
