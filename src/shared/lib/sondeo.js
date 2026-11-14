/**
 * Devuelve cada cuánto sondear según si la ventana se ve o no.
 *
 * Es la forma de `refetchInterval` que acepta TanStack Query: se vuelve a
 * evaluar después de cada consulta, así que el ritmo cambia solo al minimizar.
 *
 * @param {number} visibleMs Intervalo con la ventana a la vista.
 * @param {number} ocultoMs Intervalo con la ventana minimizada o tapada.
 * @returns {Function} `() => number`, para pasar como `refetchInterval`.
 *
 * @example
 * useQuery({ refetchInterval: intervaloSegunVentana(30_000, 60_000), refetchIntervalInBackground: true })
 */
export const intervaloSegunVentana = (visibleMs, ocultoMs) => () =>
  document.hidden ? ocultoMs : visibleMs

/**
 * Repite una consulta cada cierto tiempo sin cargar al servidor de más.
 *
 * Es el `setInterval` de siempre con tres diferencias: baja el ritmo —o se
 * detiene, con `ocultoMs` en `null`— cuando la ventana no se ve; al volver
 * consulta enseguida si ya tocaba; y nunca encima una consulta sobre otra que
 * no ha terminado, que es lo que amontona peticiones cuando el servidor va lento.
 *
 * Es para lo que no pasa por TanStack Query. Lo que sí pasa usa `refetchInterval`.
 *
 * @param {Function} consultar Lo que se repite; puede devolver una promesa.
 * @param {object} opciones Ritmo del sondeo.
 * @param {number} opciones.visibleMs Intervalo con la ventana a la vista.
 * @param {(number|null)} [opciones.ocultoMs] Intervalo con la ventana oculta; `null` lo detiene. Por omisión, igual que `visibleMs`.
 * @param {boolean} [opciones.alIniciar] Si consulta de inmediato o espera el primer intervalo.
 * @returns {Function} Para detener el sondeo; es lo que devuelve el `useEffect`.
 *
 * @example
 * useEffect(() => sondear(() => fetchPermissions(id), { visibleMs: 300_000, ocultoMs: null }), [id])
 */
export function sondear(consultar, { visibleMs, ocultoMs = visibleMs, alIniciar = true } = {}) {
  let temporizador = null;
  let cancelado = false;
  let enCurso = false;
  let ultima = 0;

  const esperaActual = () => (document.hidden ? ocultoMs : visibleMs);

  const programar = () => {
    clearTimeout(temporizador);
    temporizador = null;
    const espera = esperaActual();
    if (cancelado || espera == null) return;
    temporizador = setTimeout(ejecutar, espera);
  };

  const ejecutar = async () => {
    if (cancelado || enCurso) return;
    enCurso = true;
    ultima = Date.now();
    try {
      await consultar();
    } catch (error) {
      console.error("[sondeo]", error)
    } finally {
      enCurso = false;
      programar();
    }
  };

  const alCambiarVisibilidad = () => {
    if (cancelado || enCurso) return;
    if (!document.hidden && Date.now() - ultima >= visibleMs) {
      clearTimeout(temporizador);
      ejecutar();
      return;
    }
    programar();
  };

  document.addEventListener('visibilitychange', alCambiarVisibilidad);

  if (alIniciar) ejecutar();
  else {
    ultima = Date.now();
    programar();
  }

  return () => {
    cancelado = true;
    clearTimeout(temporizador);
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
  };
}
