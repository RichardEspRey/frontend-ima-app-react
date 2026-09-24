const apiHost = import.meta.env.VITE_API_HOST;

export const UBICACIONES_CAJA = ['PENSION NLD', 'TALLER', 'RUTA SUBIENDO', 'RUTA BAJANDO'];

export const OBSERVACIONES_CAJA = ['VACIA', 'CARGADA'];

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
