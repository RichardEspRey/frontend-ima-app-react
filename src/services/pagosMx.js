const apiHost = import.meta.env.VITE_API_HOST;

const pedir = async (archivo, op, campos = {}) => {
    const fd = new FormData();
    fd.append('op', op);
    Object.entries(campos).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null) fd.append(clave, valor);
    });

    const res = await fetch(`${apiHost}/${archivo}`, { method: 'POST', body: fd });
    const result = await res.json();

    if (result.status !== 'success') {
        throw new Error(result.message || 'No se pudo completar la operación');
    }

    return result;
};

export const PAIS = { US: 'US', MX: 'MX' };

export const pesos = (valor) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
}).format(Number(valor || 0));

export const obtenerTrayectos = async () => {
    const result = await pedir('pagos_mx.php', 'getTrayectos');
    return (Array.isArray(result.trayectos) ? result.trayectos : []).map(fila => ({
        id: String(fila.id),
        nombre: fila.nombre || '',
        monto: Number(fila.monto || 0),
        activo: String(fila.activo) === '1',
    }));
};

export const guardarTrayecto = ({ id, nombre, monto, activo }) =>
    pedir('pagos_mx.php', 'guardarTrayecto', { id, nombre, monto, activo: activo ? '1' : '0' });

export const obtenerDatosPagos = async () => {
    const result = await pedir('pagos_mx.php', 'getDatosPagos');

    const viajes = new Map((result.viajes || []).map(fila => [String(fila.trip_id), {
        nomenclatura: fila.nomenclatura || '',
        pais: fila.country_code === PAIS.MX ? PAIS.MX : PAIS.US,
        recorrido: (fila.recorrido || '').split('|').map(texto => texto.trim()).filter(Boolean),
    }]));

    const asignaciones = new Map((result.asignaciones || []).map(fila => [`${fila.trip_id}-${fila.driver_id}`, {
        trayectoId: String(fila.trayecto_id),
        trayecto: fila.trayecto || '',
        monto: Number(fila.monto || 0),
    }]));

    return { viajes, asignaciones };
};

const normalizar = (texto) => (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const esBase = (destino) => normalizar(destino).includes('nuevo laredo');

const enOrden = (recorrido = []) => [
    ...recorrido.filter(destino => !esBase(destino)),
    ...recorrido.filter(esBase),
];

const coincide = (destino, trayecto) => {
    const nombre = normalizar(trayecto.nombre);
    return nombre !== '' && normalizar(destino).includes(nombre);
};

export const sugerirTrayecto = (recorrido = [], trayectos = []) => {
    const activos = trayectos.filter(trayecto => trayecto.activo);
    for (const destino of enOrden(recorrido)) {
        const encontrado = activos.find(trayecto => coincide(destino, trayecto));
        if (encontrado) return encontrado;
    }
    return null;
};

export const nombreDeTrayecto = (recorrido = []) => {
    const [destino] = enOrden(recorrido);
    return (destino || '').split(',')[0].replace(/[.\s]+$/, '').trim();
};

export const trayectosPorCrear = (viajes = [], trayectos = []) => {
    const nombres = new Map();
    viajes.forEach(({ recorrido }) => {
        if (!recorrido?.length) return;
        if (recorrido.some(destino => trayectos.some(trayecto => coincide(destino, trayecto)))) return;
        const nombre = nombreDeTrayecto(recorrido);
        const clave = normalizar(nombre);
        if (clave && !nombres.has(clave)) nombres.set(clave, nombre);
    });
    return [...nombres.values()];
};

export const crearTrayectosSinMonto = async (nombres) => {
    const creados = [];
    for (const nombre of nombres) {
        try {
            await guardarTrayecto({ id: '', nombre, monto: 0, activo: true });
            creados.push(nombre);
        } catch {
            continue;
        }
    }
    return creados;
};

export const autorizarPagoPorTrayecto = async ({ tripId, driverId, trayecto, usuarioId }) => {
    const asignado = await pedir('pagos_mx.php', 'asignarTrayecto', {
        trip_id: tripId,
        driver_id: driverId,
        trayecto_id: trayecto.id,
        id_usuario: usuarioId,
    });

    await pedir('formularios.php', 'send_ticket_pago', {
        trip_id: tripId,
        driver_id: driverId,
        amount: asignado.monto,
        rate_per_mile: 0,
        anticipo_1: 0,
        anticipo_2: 0,
        anticipo_3: 0,
        gastos: 0,
        ajustes: '{}',
        comentarios: `Pago por trayecto: ${trayecto.nombre}`,
        comentarios_operador: '',
    });

    return Number(asignado.monto);
};
