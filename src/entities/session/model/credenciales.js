/**
 * Comprueba que estén los dos campos antes de molestar al servidor.
 *
 * @param {object} [credenciales] Lo que se escribió.
 * @param {string} [credenciales.usuario] Usuario o correo.
 * @param {string} [credenciales.contrasena] Contraseña.
 * @returns {(string|null)} Qué falta, o `null` si está completo.
 */
export function validarCredenciales({ usuario, contrasena } = {}) {
  if (!usuario?.trim() || !contrasena) {
    return "Por favor, ingresa tu usuario y contraseña."
  }
  return null
}
