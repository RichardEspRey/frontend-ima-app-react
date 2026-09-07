export const MONTOS_DTOPS = [20, 13];

const NOMBRES_DTOPS = {
    tipo: 'documentos despacho',
    categoria: 'puentes',
    subcategoria: 'dtops',
};

const buscarPorNombre = (opciones, nombre) =>
    (opciones || []).find(opcion => String(opcion.label || '').trim().toLowerCase() === nombre);

export const resolverClasificacionDtops = (tiposGasto, categorias, subcategorias) => {
    const subcategoria = buscarPorNombre(subcategorias, NOMBRES_DTOPS.subcategoria);

    const categoria = subcategoria
        ? (categorias || []).find(c => String(c.value) === String(subcategoria.id_categoria))
        : buscarPorNombre(categorias, NOMBRES_DTOPS.categoria);

    const tipo = categoria
        ? (tiposGasto || []).find(t => String(t.value) === String(categoria.id_tipo_gasto))
        : buscarPorNombre(tiposGasto, NOMBRES_DTOPS.tipo);

    if (!subcategoria || !categoria || !tipo) return null;

    return {
        id_tipo_gasto: tipo.value,
        id_categoria_mantenimiento: categoria.value,
        id_subcategoria_mantenimiento: subcategoria.value,
    };
};

export const montoDtopsValido = (monto) => {
    const numero = Number(monto);
    return Number.isFinite(numero) && numero > 0;
};

export const formatearMontoDtops = (monto) =>
    montoDtopsValido(monto) ? `$${Number(monto).toFixed(2)}` : '—';
