const apiHost = import.meta.env.VITE_API_HOST;

export const crearGastoDtops = async ({ monto, fecha, tripNumber, archivo, usuarioId, clasificacion }) => {
    const montoTexto = Number(monto).toFixed(2);

    const fd = new FormData();
    fd.append('op', 'Alta');

    fd.append('generalData', JSON.stringify({
        fecha_gasto: fecha,
        fecha_ticket: fecha,
        pais: 'US',
        moneda: 'USD',
        monto_total: montoTexto,
        cantidad_original: montoTexto,
        tipo_cambio: '',
        id_usuario: usuarioId,
    }));

    fd.append('detailsData', JSON.stringify([{
        id_tipo_gasto: clasificacion.id_tipo_gasto,
        id_articulo: null,
        descripcion_articulo: tripNumber,
        cantidad_articulo: 1,
        precio_unitario: montoTexto,
        id_categoria_mantenimiento: clasificacion.id_categoria_mantenimiento,
        id_subcategoria_mantenimiento: clasificacion.id_subcategoria_mantenimiento,
    }]));

    if (archivo) fd.append('ticket_jpg_file', archivo, archivo.name);

    const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: fd });
    const result = await res.json();

    if (result.status !== 'success') {
        throw new Error(result.message || 'No se pudo registrar el gasto del DTOPS');
    }

    return result;
};
