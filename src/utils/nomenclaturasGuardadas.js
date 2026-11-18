const LLAVE = 'nomenclaturas_de_viajes';
const VIGENCIA_MS = 30 * 24 * 60 * 60 * 1000;
const MAXIMO = 300;

const leerTodo = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(LLAVE) || '{}');
    return guardado && typeof guardado === 'object' ? guardado : {};
  } catch {
    return {};
  }
};

export const leerNomenclaturas = (ahora = Date.now()) =>
  Object.fromEntries(
    Object.entries(leerTodo())
      .filter(([, valor]) => Array.isArray(valor) && valor[0] && ahora - valor[1] < VIGENCIA_MS)
      .map(([id, valor]) => [id, valor[0]])
  );

export const guardarNomenclaturas = (nuevas, ahora = Date.now()) => {
  const vigentes = Object.entries(leerTodo()).filter(
    ([id, valor]) => Array.isArray(valor) && ahora - valor[1] < VIGENCIA_MS && !(id in nuevas)
  );
  const todas = [
    ...vigentes,
    ...Object.entries(nuevas).filter(([, texto]) => texto).map(([id, texto]) => [id, [texto, ahora]]),
  ]
    .sort((a, b) => a[1][1] - b[1][1])
    .slice(-MAXIMO);
  try {
    localStorage.setItem(LLAVE, JSON.stringify(Object.fromEntries(todas)));
  } catch {
    return;
  }
};
