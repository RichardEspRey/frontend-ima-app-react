export const fechaCorta = (valor) => {
    if (!valor) return '—';
    const [fecha] = String(valor).split(' ');
    const [anio, mes, dia] = fecha.split('-');
    if (!anio || !mes || !dia) return String(valor);
    return `${Number(dia)}/${Number(mes)}/${anio}`;
};
