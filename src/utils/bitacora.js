import { relojEnZona, ZONA_AVISOS } from './avisos';

export const ZONA_BITACORA = ZONA_AVISOS;

export const MODULOS = {
  'AccessManager.php': 'Accesos',
  'features.php': 'Accesos',
  'Auth.php': 'Inicio de sesión',
  'Cotizaciones.php': 'Cotizaciones',
  'IFTA.php': 'IFTA',
  'IMA_Docs.php': 'Documentos IMA',
  'IMA_Docsv2.php': 'Documentos IMA',
  'Mobile.php': 'App móvil',
  'Notifications.php': 'Notificaciones',
  'Programacion_viajes.php': 'Programación de viajes',
  'caja_externa.php': 'Cajas externas',
  'cajas.php': 'Cajas',
  'cajas_v2.php': 'Cajas',
  'cajas_docs.php': 'Documentos de cajas',
  'cajas_estatus.php': 'Estatus de cajas',
  'companies.php': 'Compañías',
  'drivers.php': 'Conductores',
  'drivers_v2.php': 'Conductores',
  'drivers_docs.php': 'Documentos de conductores',
  'estatus_unidades.php': 'Estatus de unidades',
  'formularios.php': 'Gastos, diesel y pagos',
  'inspecciones.php': 'Inspecciones',
  'mtto.php': 'Reparaciones',
  'new_trips.php': 'Viajes',
  'new_tripsv2.php': 'Viajes',
  'trips.php': 'Viajes',
  'trips_docs.php': 'Documentos de viajes',
  'pagos_admin.php': 'Nómina',
  'pagos_mx.php': 'Pagos MX',
  'personal_admin.php': 'Personal',
  'roadside_repairs.php': 'Reparaciones en ruta',
  'safety.php': 'Safety',
  'save_expense.php': 'Gastos',
  'service_order.php': 'Órdenes de servicio',
  'teams.php': 'Equipos',
  'trucks.php': 'Camiones',
  'trucks_v2.php': 'Camiones',
  'trucks_docs.php': 'Documentos de camiones',
  'update_invoices.php': 'Facturas',
  'warehouses.php': 'Bodegas',
};

const ACCIONES = {
  'AccessManager.php#updatePermission': 'Cambió un permiso',
  'Auth.php#new_login': 'Inició sesión',
  'Cotizaciones.php#eliminar': 'Borró una cotización',
  'Cotizaciones.php#guardar': 'Guardó una cotización',
  'IFTA.php#delete_ifta_state': 'Borró un estado de IFTA',
  'IFTA.php#delete_ifta_trip': 'Borró un viaje de IFTA',
  'IFTA.php#insert_ifta': 'Capturó IFTA',
  'IMA_Docs.php#Alta': 'Subió un documento de IMA',
  'Mobile.php#send_push': 'Mandó un aviso al teléfono de un operador',
  'Notifications.php#subscribe': 'Dio de alta a alguien en los avisos de BL',
  'Notifications.php#unsubscribe': 'Quitó a alguien de los avisos de BL',
  'Notifications.php#suscribir': 'Dio de alta a alguien en un aviso',
  'Notifications.php#desuscribir': 'Quitó a alguien de un aviso',
  'Notifications.php#create': 'Registró una notificación',
  'Programacion_viajes.php#insert': 'Programó un viaje',
  'Programacion_viajes.php#update': 'Editó un viaje programado',
  'Programacion_viajes.php#delete': 'Borró un viaje programado',
  'caja_externa.php#Alta': 'Dio de alta una caja externa',
  'cajas.php#Alta': 'Dio de alta una caja',
  'cajas.php#editTrailer': 'Editó una caja',
  'cajas_docs.php#Alta': 'Subió un documento de caja',
  'cajas_estatus.php#saveEstatusCaja': 'Cambió el estatus de una caja',
  'companies.php#CreateCompany': 'Dio de alta una compañía',
  'companies.php#save_company_invoice_info': 'Guardó los datos de facturación de una compañía',
  'drivers.php#Alta': 'Dio de alta un conductor',
  'drivers.php#editDriver': 'Editó un conductor',
  'drivers_docs.php#Alta': 'Subió un documento de conductor',
  'estatus_unidades.php#update_config': 'Cambió la configuración de una unidad',
  'features.php#create_user': 'Creó un usuario',
  'features.php#toggle_user_feature': 'Cambió un permiso de un usuario',
  'features.php#update_user': 'Editó un usuario',
  'formularios.php#I_pago_stage_bulk': 'Guardó cobros de etapas en Ventas',
  'formularios.php#I_update_millasDriverBulk': 'Cambió las tarifas por milla de conductores',
  'formularios.php#U_CL_Final': 'Editó una inspección final',
  'formularios.php#add_manual_diesel': 'Capturó diesel a mano',
  'formularios.php#delete_diesel': 'Borró una carga de diesel',
  'formularios.php#delete_gasto': 'Borró un gasto de viaje',
  'formularios.php#edit_diesel': 'Editó una carga de diesel',
  'formularios.php#edit_gasto': 'Editó un gasto de viaje',
  'formularios.php#send_ticket_pago': 'Autorizó el pago de un viaje',
  'formularios.php#update_ticket_pago': 'Marcó como pagado un viaje',
  'formularios.php#set_diesel_usar_fleetone': 'Cambió la fuente de diesel de un viaje',
  'inspecciones.php#delete_doc': 'Borró un documento de inspección',
  'inspecciones.php#save': 'Guardó una inspección',
  'mtto.php#resolverPuntos': 'Resolvió puntos de una inspección',
  'mtto.php#descartarPendientes': 'Descartó reparaciones pendientes',
  'mtto.php#crearPendiente': 'Levantó una reparación pendiente',
  'mtto.php#actualizarPendiente': 'Editó una reparación pendiente',
  'mtto.php#completarLado': 'Cerró una inspección',
  'mtto.php#crearOrden': 'Creó una orden de servicio',
  'mtto.php#ligarGasto': 'Ligó un gasto a una orden de servicio',
  'mtto.php#eliminarOrden': 'Borró una orden de servicio',
  'mtto.php#suscribirInspeccion': 'Dio de alta a alguien en los avisos de inspección',
  'mtto.php#desuscribirInspeccion': 'Quitó a alguien de los avisos de inspección',
  'new_trips.php#AlmostOverTrip': 'Marcó un viaje como Almost Over',
  'new_trips.php#FinalizeTrip': 'Finalizó un viaje',
  'new_trips.php#activate_trip': 'Reactivó un viaje',
  'new_trips.php#delete_trip': 'Borró un viaje',
  'new_trips.php#update_invoices': 'Actualizó las facturas de un viaje',
  'new_tripsv2.php#salida_trip': 'Dio salida a un viaje',
  'new_tripsv2.php#add_status_caja_trips': 'Registró el estatus de la caja de un viaje',
  'pagos_admin.php#authorize': 'Autorizó una nómina',
  'pagos_mx.php#guardarTrayecto': 'Guardó un trayecto MX',
  'pagos_mx.php#asignarTrayecto': 'Asignó el trayecto de un viaje MX',
  'personal_admin.php#add': 'Dio de alta personal',
  'personal_admin.php#delete': 'Borró personal',
  'roadside_repairs.php#delete_doc': 'Borró un documento de reparación en ruta',
  'roadside_repairs.php#save': 'Guardó una reparación en ruta',
  'safety.php#delete_doc': 'Borró un documento de Safety',
  'safety.php#upload_doc': 'Subió un documento de Safety',
  'save_expense.php#Alta': 'Capturó un gasto',
  'save_expense.php#deleteExpense': 'Borró un gasto',
  'service_order.php#AltaOrden': 'Creó una orden de servicio',
  'service_order.php#UpdateOrder': 'Editó una orden de servicio',
  'service_order.php#updateDetailStatus': 'Cambió el estatus de un servicio',
  'teams.php#create_team': 'Creó un equipo',
  'teams.php#delete_team': 'Borró un equipo',
  'teams.php#edit_team': 'Editó un equipo',
  'teams.php#save_team_users': 'Cambió los integrantes de un equipo',
  'trucks.php#Alta': 'Dio de alta un camión',
  'trucks.php#editTruck': 'Editó un camión',
  'trucks_docs.php#Alta': 'Subió un documento de camión',
  'update_invoices.php#update_invoices': 'Actualizó facturas',
  'warehouses.php#CreateWarehouse': 'Dio de alta una bodega',
};

const VERBOS = [
  [/^(delete|eliminar|borrar|remove|quitar|desuscribir|unsubscribe)/i, 'Borró'],
  [/^(update|edit|editar|actualizar|cambiar|toggle|set_|u_)/i, 'Editó'],
  [/^(alta|add|create|crear|insert|i_|nuevo|new|registrar|subir|upload|suscribir|subscribe)/i, 'Dio de alta'],
  [/^(save|guardar)/i, 'Guardó'],
];

export const moduloDe = (archivo) => MODULOS[archivo] || String(archivo || '').replace(/\.php$/i, '');

export const accionDe = (archivo, op) => {
  const conocida = ACCIONES[`${archivo}#${op}`];
  if (conocida) return conocida;
  const verbo = VERBOS.find(([patron]) => patron.test(op || ''));
  return verbo ? `${verbo[1]} en ${moduloDe(archivo)} (${op})` : `${op} en ${moduloDe(archivo)}`;
};

const dosDigitos = (n) => String(n).padStart(2, '0');

export const fechaUtcADate = (texto) => {
  const fecha = new Date(`${String(texto || '').replace(' ', 'T')}Z`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

export const horaLocal = (fechaUtc, zona = ZONA_BITACORA) => {
  const fecha = fechaUtcADate(fechaUtc);
  if (!fecha) return '';
  const r = relojEnZona(fecha, zona);
  return `${dosDigitos(r.dia)}/${dosDigitos(r.mes)}/${r.anio} ${dosDigitos(r.hora)}:${dosDigitos(r.minuto)}:${dosDigitos(r.segundo)}`;
};

export const inicioDelDiaEnUtc = (diaLocal, zona = ZONA_BITACORA) => {
  const [anio, mes, dia] = String(diaLocal || '').split('-').map(Number);
  if (!anio || !mes || !dia) return '';
  const supuesto = Date.UTC(anio, mes - 1, dia, 0, 0, 0);
  const r = relojEnZona(new Date(supuesto), zona);
  const comoLocal = Date.UTC(r.anio, r.mes - 1, r.dia, r.hora, r.minuto, r.segundo);
  const utc = new Date(supuesto - (comoLocal - supuesto));
  return utc.toISOString().slice(0, 19).replace('T', ' ');
};

export const diaSiguiente = (diaLocal) => {
  const [anio, mes, dia] = String(diaLocal || '').split('-').map(Number);
  if (!anio || !mes || !dia) return '';
  return new Date(Date.UTC(anio, mes - 1, dia + 1)).toISOString().slice(0, 10);
};

export const hoyLocal = (ahora = new Date(), zona = ZONA_BITACORA) => {
  const r = relojEnZona(ahora, zona);
  return `${r.anio}-${dosDigitos(r.mes)}-${dosDigitos(r.dia)}`;
};

export const restarDias = (diaLocal, dias) => {
  const [anio, mes, dia] = String(diaLocal || '').split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia - dias)).toISOString().slice(0, 10);
};

export const rangoEnUtc = ({ desde, hasta }) => ({
  desde_utc: desde ? inicioDelDiaEnUtc(desde) : '',
  hasta_utc: hasta ? inicioDelDiaEnUtc(diaSiguiente(hasta)) : '',
});

export const leerDatos = (texto) => {
  if (!texto) return [];
  try {
    const datos = JSON.parse(texto);
    if (!datos || typeof datos !== 'object') return [['valor', String(texto)]];
    return Object.entries(datos).map(([clave, valor]) => [
      clave,
      typeof valor === 'string' ? valor : JSON.stringify(valor),
    ]);
  } catch {
    return [['datos', String(texto)]];
  }
};

export const textoDeApp = (fila, vacio = '—') => {
  if (!fila?.app) return vacio;
  if (fila.app_version) return `${fila.app} ${fila.app_version}`;
  return ['Desktop', 'Movil'].includes(fila.app) ? `${fila.app} · sin actualizar` : fila.app;
};
