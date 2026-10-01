const apiHost = import.meta.env.VITE_API_HOST;

export const UNIDAD = { CAMION: 'camion', CAJA: 'caja' };

export const ESTATUS_PUNTO = {
    SIN_RESOLVER: 'sin_resolver',
    EN_PENDIENTES: 'en_pendientes',
    CON_ORDEN: 'con_orden',
    DESCARTADO: 'descartado',
};

export const ETIQUETA_ESTATUS = {
    [ESTATUS_PUNTO.EN_PENDIENTES]: 'En pendientes',
    [ESTATUS_PUNTO.CON_ORDEN]: 'Con orden',
    [ESTATUS_PUNTO.DESCARTADO]: 'Descartado',
};

// Los seis rubros del checklist del operador. El remolque es de la caja; el resto,
// del tractor: de ahí sale que la misma inspección se trabaje por dos lados.
export const RUBROS = [
    { clave: 'motor', etiqueta: 'Motor', tabla: 'cl_motor', unidad: UNIDAD.CAMION },
    { clave: 'exterior', etiqueta: 'Exterior', tabla: 'cl_exterior', unidad: UNIDAD.CAMION },
    { clave: 'neumaticos', etiqueta: 'Neumáticos', tabla: 'cl_neumaticos', unidad: UNIDAD.CAMION },
    { clave: 'cabina', etiqueta: 'Cabina', tabla: 'cl_cabina', unidad: UNIDAD.CAMION },
    { clave: 'otro', etiqueta: 'Otro', tabla: 'cl_otro', unidad: UNIDAD.CAMION },
    { clave: 'remolque', etiqueta: 'Remolque', tabla: 'cl_remolque', unidad: UNIDAD.CAJA },
];

// Lo que el operador escribe cuando no hay nada que reparar. Son 64 de cada 145 puntos
// que manda, así que esconderlos es la diferencia entre leer una lista de trabajo y
// leer una lista de "todo bien".
const SIN_FALLA = new Set([
    '', 'ok', 'okay', 'o k', 'todo ok', 'bien', 'todo bien', 'buen estado', 'en buen estado',
    'todo en orden', 'sin novedad', 'sin novedades', 'sin fallas', 'sin falla', 'correcto',
    'na', 'n a', 'ninguna', 'ninguno', 'nada', 'no aplica',
]);

const normalizar = (texto) => (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s.,;:!¡¿?*\-_/]+/g, ' ')
    .trim();

export const esPuntoSinFalla = (texto) => SIN_FALLA.has(normalizar(texto));

const pedirMtto = async (op, campos = {}) => {
    const fd = new FormData();
    fd.append('op', op);
    Object.entries(campos).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null) fd.append(clave, valor);
    });

    const res = await fetch(`${apiHost}/mtto.php`, { method: 'POST', body: fd });
    const result = await res.json();

    if (result.status !== 'success') {
        throw new Error(result.message || 'No se pudo completar la operación');
    }

    return result;
};

// El conteo de «por atender» sale del servidor ya filtrado: `All_CL_Final` cuenta
// renglones, incluidos los «ok», y por eso una inspección con 3 cosas que hacer
// aparecía con 5.
export const obtenerInspeccionesDeLado = async (lado) => {
    const result = await pedirMtto('getInspecciones', { lado });
    return Array.isArray(result.inspecciones) ? result.inspecciones : [];
};

export const obtenerPuntos = async (viajeId, lado) => {
    const result = await pedirMtto('getPuntos', { viaje_id: viajeId, lado });
    return (Array.isArray(result.puntos) ? result.puntos : []).map(punto => ({
        ...punto,
        clave: `${punto.origen_tabla}-${punto.origen_id}`,
        origenTabla: punto.origen_tabla,
        origenId: Number(punto.origen_id),
        unidadTipo: punto.unidad_tipo,
    }));
};

export const resolverPuntos = ({ items, estatus, usuarioId }) =>
    pedirMtto('resolverPuntos', { items: JSON.stringify(items), estatus, id_usuario: usuarioId });

export const obtenerPendientes = async (unidadTipo) => {
    const result = await pedirMtto('getPendientes', { unidad_tipo: unidadTipo });
    return Array.isArray(result.pendientes) ? result.pendientes : [];
};

export const crearPendienteManual = ({ unidadTipo, unidadId, descripcion, usuarioId }) =>
    pedirMtto('crearPendiente', { unidad_tipo: unidadTipo, unidad_id: unidadId, descripcion, id_usuario: usuarioId });

export const crearOrden = ({ unidadTipo, unidadId, fecha, tipoCambio, servicios, usuarioId }) =>
    pedirMtto('crearOrden', {
        unidad_tipo: unidadTipo,
        unidad_id: unidadId,
        fecha,
        tipo_cambio: tipoCambio || '',
        servicios: JSON.stringify(servicios),
        id_usuario: usuarioId,
    });

export const ligarGastos = (ligas) => pedirMtto('ligarGasto', { ligas: JSON.stringify(ligas) });

// El tipo de gasto con el que entran las refacciones del taller. Lo pide
// `save_expense.php` por id, no por nombre.
export const TIPO_GASTO_MANTENIMIENTO = '3';

/**
 * Da de alta el gasto en el Administrador de Gastos, con sus comprobantes.
 *
 * Se usa el mismo endpoint que la pantalla de Nuevo Gasto para que el gasto nazca
 * idéntico a uno capturado a mano: misma moneda, mismo tipo de cambio, mismos
 * catálogos. Lo único que cambia es de dónde viene.
 */
export const crearGasto = async ({ gasto, usuarioId }) => {
    const esMexico = gasto.pais === 'MX';
    const total = gasto.conceptos.reduce(
        (suma, c) => suma + (Number(c.precio_unitario) || 0) * (Number(c.cantidad) || 0), 0);

    const fd = new FormData();
    if (gasto.factura) fd.append('factura_pdf_file', gasto.factura);
    if (gasto.ticket) fd.append('ticket_jpg_file', gasto.ticket);

    fd.append('generalData', JSON.stringify({
        fecha_gasto: gasto.fecha_gasto,
        fecha_ticket: gasto.fecha_ticket,
        pais: gasto.pais,
        moneda: esMexico ? 'MXN' : 'USD',
        monto_total: total,
        cantidad_original: Number(gasto.cantidad_original) || total,
        tipo_cambio: esMexico ? gasto.tipo_cambio : '',
        id_usuario: usuarioId,
    }));

    fd.append('detailsData', JSON.stringify(gasto.conceptos.map(concepto => ({
        id_tipo_gasto: TIPO_GASTO_MANTENIMIENTO,
        id_articulo: null,
        descripcion_articulo: concepto.descripcion.trim(),
        cantidad_articulo: Number(concepto.cantidad) || 0,
        precio_unitario: Number(concepto.precio_unitario) || 0,
        id_categoria_mantenimiento: concepto.categoria || null,
        id_subcategoria_mantenimiento: concepto.subcategoria || null,
    }))));

    // La orden ya no consume del inventario, así que su gasto tampoco lo alimenta: sin
    // esto, cada refacción comprada entraría como stock que nada vuelve a descontar.
    fd.append('omitir_inventario', '1');
    fd.append('op', 'Alta');

    const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: fd });
    const result = await res.json();

    if (result.status !== 'success') {
        throw new Error(result.message || 'No se pudo crear el gasto');
    }

    return result;
};

export const completarLado = ({ clFinalId, viajeId, lado, usuarioId }) =>
    pedirMtto('completarLado', { cl_final_id: clFinalId, viaje_id: viajeId, lado, id_usuario: usuarioId });

const pedirFormularios = async (op, campos = {}) => {
    const cuerpo = Object.entries({ op, ...campos })
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
        .join('&');

    const res = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cuerpo,
    });
    const result = await res.json();

    if (result.status !== 'success' && result.status !== undefined && result.status !== 'ok') {
        throw new Error(result.message || 'No se pudo consultar la inspección');
    }

    return result;
};

export const obtenerInspecciones = async () => {
    const result = await pedirFormularios('All_CL_Final');
    return Array.isArray(result.row) ? result.row : [];
};

export const obtenerDetalle = (viajeId) => pedirFormularios('collapse_CL_Final', { trip_id: viajeId });

/**
 * Los puntos de una inspección, ya sin el ruido y con su rubro y unidad resueltos.
 */
export const puntosDeDetalle = (detalle) => {
    if (!detalle) return [];

    return RUBROS.flatMap(rubro => (detalle[rubro.clave] || [])
        .filter(fila => !esPuntoSinFalla(fila.contenido))
        .map(fila => ({
            clave: `${rubro.tabla}-${fila.id}`,
            categoria: rubro.etiqueta,
            rubro: rubro.clave,
            origenTabla: rubro.tabla,
            origenId: Number(fila.id),
            texto: (fila.contenido || '').trim(),
            unidadTipo: rubro.unidad,
            fecha: fila.fecha,
        })));
};

export const puntosDeUnidad = (puntos, unidadTipo) => puntos.filter(p => p.unidadTipo === unidadTipo);

export const agruparPorRubro = (puntos) => RUBROS
    .map(rubro => ({ ...rubro, puntos: puntos.filter(p => p.rubro === rubro.clave) }))
    .filter(rubro => rubro.puntos.length > 0);
