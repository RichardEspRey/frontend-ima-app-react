export const EVENTO_NOTIFICACIONES_NUEVAS = 'ima:notificaciones-nuevas';

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
      console.error('[sondeo]', error);
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
