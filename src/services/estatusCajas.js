const apiHost = import.meta.env.VITE_API_HOST;

export const UBICACIONES_CAJA = [
    'PENSION NLD', 'PENSION USA', 'TALLER', 'MANTENIMIENTO', 'RUTA SUBIENDO', 'RUTA BAJANDO', 'AGENCIA ADUANAL',
];

export const OBSERVACIONES_CAJA = ['VACIA', 'CARGADA', 'CARGANDO', 'DESCARGANDO'];

const AZUL = { fondo: '#dbeafe', texto: '#1e40af', punto: '#3b82f6' };
const ROJO = { fondo: '#fee2e2', texto: '#991b1b', punto: '#ef4444' };
const VERDE = { fondo: '#dcfce7', texto: '#166534', punto: '#22c55e' };
const CELESTE = { fondo: '#cffafe', texto: '#155e75', punto: '#06b6d4' };
const CAFE = { fondo: '#efe4d8', texto: '#7c4a2d', punto: '#8b5a3c' };
const AMARILLO = { fondo: '#fef9c3', texto: '#854d0e', punto: '#eab308' };
const MORADO = { fondo: '#f3e8ff', texto: '#6b21a8', punto: '#a855f7' };

export const COLORES_ESTATUS_CAJA = {
    'PENSION NLD': AZUL,
    'PENSION USA': ROJO,
    'RUTA SUBIENDO': VERDE,
    'RUTA BAJANDO': CELESTE,
    TALLER: CAFE,
    MANTENIMIENTO: AMARILLO,
    'AGENCIA ADUANAL': MORADO,
    CARGADA: VERDE,
    VACIA: AMARILLO,
    CARGANDO: AZUL,
    DESCARGANDO: CELESTE,
};

export const LARGO_COMENTARIO = 300;

const pedir = async (op, campos = {}) => {
    const fd = new FormData();
    fd.append('op', op);
    Object.entries(campos).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null) fd.append(clave, valor);
    });

    const res = await fetch(`${apiHost}/cajas_estatus.php`, { method: 'POST', body: fd });
    const result = await res.json();

    if (result.status !== 'success') {
        throw new Error(result.message || 'No se pudo completar la operación');
    }

    return result;
};

export const obtenerEstatusCajas = async () => {
    const result = await pedir('getEstatusCajas');
    return Array.isArray(result.cajas) ? result.cajas : [];
};

export const guardarEstatusCaja = ({ cajaId, ubicacion, observacion, comentario, usuarioId }) =>
    pedir('saveEstatusCaja', {
        caja_id: cajaId,
        ubicacion,
        observacion,
        comentario: comentario ?? '',
        id_usuario: usuarioId,
    });

export const subirFianzaCaja = async ({ cajaId, archivo, vencimiento }) => {
    const fd = new FormData();
    fd.append('op', 'Alta');
    fd.append('caja_id', cajaId);
    fd.append('tipo_documento', 'Fianza');
    fd.append('fecha_vencimiento', vencimiento);
    fd.append('documento', archivo);

    const res = await fetch(`${apiHost}/cajas_docs.php`, { method: 'POST', body: fd });
    const result = await res.json();

    if (result.status !== 'success') {
        throw new Error(result.message || 'No se pudo subir la fianza');
    }

    return result;
};
