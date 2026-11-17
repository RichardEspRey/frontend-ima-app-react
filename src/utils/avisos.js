export const ZONA_AVISOS = 'America/Monterrey';
export const HORA_CORTE_DIESEL = 10;
export const DIAS_DE_AVISO = 14;

const dosDigitos = (n) => String(n).padStart(2, '0');

export const fechaLocal = (fecha) =>
  `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())} ` +
  `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`;

export const relojEnZona = (fecha, zona = ZONA_AVISOS) => {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(fecha)
      .map((p) => [p.type, p.value])
  );
  return {
    anio: Number(partes.year),
    mes: Number(partes.month),
    dia: Number(partes.day),
    hora: Number(partes.hour),
    minuto: Number(partes.minute),
    segundo: Number(partes.second),
  };
};

export const corteDiario = (ahora, { zona = ZONA_AVISOS, hora = HORA_CORTE_DIESEL } = {}) => {
  const reloj = relojEnZona(ahora, zona);
  const yaPaso = reloj.hora >= hora;
  const dia = new Date(Date.UTC(reloj.anio, reloj.mes - 1, reloj.dia - (yaPaso ? 0 : 1)));
  const segundosDesdeElCorte =
    (reloj.hora - hora + (yaPaso ? 0 : 24)) * 3600 + reloj.minuto * 60 + reloj.segundo;
  return {
    fecha: dia.toISOString().slice(0, 10),
    momento: new Date(ahora.getTime() - segundosDesdeElCorte * 1000),
  };
};

const entero = (valor) => parseInt(valor || 0, 10) || 0;

const plural = (n, singular, pluralizado) => `${n} ${n === 1 ? singular : pluralizado}`;

export const avisosDeDiesel = (viajes, corte) => {
  const resumen = (campo) => {
    const conPendientes = viajes.filter((v) => entero(v[campo]) > 0);
    return {
      viajes: conPendientes.length,
      total: conPendientes.reduce((suma, v) => suma + entero(v[campo]), 0),
    };
  };
  const creado = fechaLocal(corte.momento);
  const state = resumen('state_pending_count');
  const fleet = resumen('fleetone_pending_count');
  const avisos = [];

  if (state.total > 0) {
    avisos.push({
      id: `diesel-state-${corte.fecha}`,
      tipo: 'diesel',
      titulo: 'State pending',
      subtitulo: `${plural(state.total, 'estado pendiente', 'estados pendientes')} en ${plural(state.viajes, 'viaje', 'viajes')}`,
      created_at: creado,
      destino: { ruta: '/admin-diesel', estado: { tabValue: 0 } },
    });
  }
  if (fleet.total > 0) {
    avisos.push({
      id: `diesel-fleetone-${corte.fecha}`,
      tipo: 'diesel',
      titulo: 'Fleet One pending',
      subtitulo: `${plural(fleet.total, 'ticket pendiente', 'tickets pendientes')} en ${plural(fleet.viajes, 'viaje', 'viajes')}`,
      created_at: creado,
      destino: { ruta: '/admin-diesel', estado: { tabValue: 0 } },
    });
  }
  return avisos;
};

const unidadesDe = (fila) =>
  [fila.no_camion ? `Camión ${fila.no_camion}` : '', fila.no_caja ? `Caja ${fila.no_caja}` : '']
    .filter(Boolean)
    .join(' · ');

const nomenclaturaSimple = (fila) =>
  [fila.trip_number, fila.country_code, fila.trip_year].filter(Boolean).join('-');

const MAXIMO_EN_DETALLE = 3;

const resumirLista = (elementos) =>
  elementos.length <= MAXIMO_EN_DETALLE
    ? elementos.join(', ')
    : `${elementos.slice(0, MAXIMO_EN_DETALLE).join(', ')} y ${elementos.length - MAXIMO_EN_DETALLE} más`;

export const avisosSinFallas = (inspecciones, ahora) => {
  const limite = fechaLocal(new Date(ahora.getTime() - DIAS_DE_AVISO * 86400000)).slice(0, 10);
  return inspecciones
    .filter((fila) => String(fila.fecha_creacion || '').slice(0, 10) >= limite)
    .map((fila) => ({
      id: `sin-fallas-${fila.cl_final_id}`,
      tipo: 'mantenimiento',
      titulo: `Inspección sin fallas ${fila.nomenclatura || nomenclaturaSimple(fila)}`.trim(),
      subtitulo: [unidadesDe(fila), fila.operador].filter(Boolean).join(' · '),
      created_at: fila.fecha_creacion,
      destino: { ruta: '/mantenimiento?pestana=inspecciones&sub=sin-fallas' },
    }));
};

const llaveDeOperador = (nombre) =>
  nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const avisosSinInspeccion = (viajes) => {
  const porOperador = new Map();
  viajes.forEach((viaje) => {
    const operador = String(viaje.operador || '').trim();
    if (!operador) return;
    const llave = llaveDeOperador(operador);
    const grupo = porOperador.get(llave) || { operador, viajes: [] };
    grupo.viajes.push(viaje);
    porOperador.set(llave, grupo);
  });

  return [...porOperador.entries()]
    .filter(([, grupo]) => grupo.viajes.length > 1)
    .map(([llave, grupo]) => {
      const fechas = grupo.viajes.map((v) => String(v.creation_date || '')).sort();
      const nomenclaturas = grupo.viajes.map((v) => v.nomenclatura).filter(Boolean);
      return {
        id: `sin-inspeccion-${llave}-${grupo.viajes.length}`,
        tipo: 'mantenimiento',
        titulo: 'Viajes sin inspección',
        subtitulo: `${grupo.operador} · ${grupo.viajes.length} viajes`,
        detalle: resumirLista(nomenclaturas),
        created_at: fechas[fechas.length - 1],
        destino: { ruta: '/mantenimiento?pestana=inspecciones&sub=sin-inspeccion' },
      };
    });
};

const horaCorta = (texto) => {
  const [fecha, hora = ''] = String(texto).split(/[ T]/);
  const [, mes, dia] = fecha.split('-');
  return mes && dia ? `${dia}/${mes}${hora ? ` ${hora.slice(0, 5)}` : ''}` : '';
};

export const avisosDeProgramacion = (programaciones, vistas, ahora) => {
  const ahoraLocal = fechaLocal(ahora);
  const nuevasVistas = {};
  const avisos = programaciones.map((p) => {
    const creado = vistas[p.id] || ahoraLocal;
    nuevasVistas[p.id] = creado;
    return {
      id: `programacion-${p.id}`,
      tipo: 'programacion',
      titulo: 'Viaje programado',
      subtitulo: [
        p.nombre_compania || p.destino,
        p.truck_unidad ? `Camión ${p.truck_unidad}` : '',
        p.driver_nombre,
      ]
        .filter(Boolean)
        .join(' · '),
      detalle: [p.destino && p.nombre_compania ? p.destino : '', p.salida ? `Sale ${horaCorta(p.salida)}` : '']
        .filter(Boolean)
        .join(' · '),
      created_at: creado,
      destino: { ruta: '/admin-trips', pestanaViajes: 4 },
    };
  });
  return { avisos, vistas: nuevasVistas };
};

export const nombreDeDocumento = (tipo) => String(tipo || '').replace(/_/g, ' ').trim().toUpperCase();

export const documentosDeViaje = (viaje) =>
  (viaje.etapas || []).flatMap((etapa) => [
    ...(etapa.documentos_adjuntos || []).map((d) => ({ id: String(d.document_id), tipo: d.tipo_documento })),
    ...(etapa.stops_in_transit || [])
      .filter((parada) => parada.bl_firmado_doc?.document_id)
      .map((parada) => ({ id: String(parada.bl_firmado_doc.document_id), tipo: 'bl_firmado' })),
  ]);

export const faltantesDeViaje = (viaje) =>
  (viaje.etapas || []).flatMap((etapa) =>
    Array.isArray(etapa.documentos_faltantes_lista) ? etapa.documentos_faltantes_lista : []
  );

const textoDeFaltantes = (viaje) => {
  const faltantes = faltantesDeViaje(viaje);
  return faltantes.length > 0
    ? `Faltan ${faltantes.length}: ${faltantes.map(nombreDeDocumento).join(', ')}`
    : 'Documentos completos';
};

export const avisosDeDespacho = (viajes) =>
  viajes.map((viaje) => ({
    id: `despacho-${viaje.trip_id}`,
    tipo: 'despacho',
    titulo: `Viaje en despacho ${viaje.trip_number || ''}`.trim(),
    subtitulo: [viaje.truck_unidad ? `Camión ${viaje.truck_unidad}` : '', viaje.driver_nombre]
      .filter(Boolean)
      .join(' · '),
    detalle: textoDeFaltantes(viaje),
    created_at: viaje.creation_date,
    destino: { ruta: '/admin-trips', pestanaViajes: 1 },
  }));

export const avisosDeDocumentos = (viajes, base, ahora) => {
  const creado = fechaLocal(ahora);
  const nuevaBase = {};
  const avisos = [];

  viajes.forEach((viaje) => {
    const documentos = documentosDeViaje(viaje);
    const llave = String(viaje.trip_id);
    nuevaBase[llave] = documentos.map((d) => d.id);
    if (!base || !base[llave]) return;

    const conocidos = new Set(base[llave]);
    const agregados = documentos.filter((d) => !conocidos.has(d.id));
    if (agregados.length === 0) return;

    const nombres = agregados.map((d) => nombreDeDocumento(d.tipo)).join(', ');
    avisos.push({
      id: `documentos-${llave}-${agregados.map((d) => d.id).sort().join('-')}`,
      tipo: 'documentos',
      titulo:
        agregados.length === 1
          ? `Documento agregado ${viaje.trip_number || ''}`.trim()
          : `${agregados.length} documentos agregados ${viaje.trip_number || ''}`.trim(),
      subtitulo: nombres,
      detalle: textoDeFaltantes(viaje),
      created_at: creado,
      destino: { ruta: '/admin-trips', pestanaViajes: 1 },
    });
  });

  return { avisos, base: nuevaBase };
};

export const recortarAvisos = (avisos, ahora, maximo = 60) => {
  const limite = fechaLocal(new Date(ahora.getTime() - DIAS_DE_AVISO * 86400000));
  return avisos.filter((a) => String(a.created_at) >= limite).slice(0, maximo);
};
