/**
 * Los archivos PHP de la API. Es el **único** lugar del proyecto donde aparece
 * un `.php`: fuera de aquí nadie sabe qué hay del otro lado.
 *
 * @readonly
 * @enum {string}
 */
export const ENDPOINTS = {
  accessManager: "AccessManager.php",
  afinaciones: "afinaciones.php",
  auth: "Auth.php",
  autonomia: "autonomia.php",
  cajas: "cajas.php",
  cajasDocs: "cajas_docs.php",
  cajaExterna: "caja_externa.php",
  charts: "charts.php",
  companies: "companies.php",
  cotizaciones: "Cotizaciones.php",
  // Conviven dos versiones: la v2 la usa el Centro de Documentos y la v1 sigue
  // viva porque el Sidebar lee de ella para el contador de pendientes.
  documentos: "IMA_Docs.php",
  documentosV2: "IMA_Docsv2.php",
  drivers: "drivers.php",
  driversDocs: "drivers_docs.php",
  estatusUnidades: "estatus_unidades.php",
  features: "features.php",
  formularios: "formularios.php",
  gastos: "save_expense.php",
  ifta: "IFTA.php",
  inspecciones: "inspecciones.php",
  inventario: "inventory.php",
  movil: "Mobile.php",
  nuevosViajes: "new_trips.php",
  pagosAdmin: "pagos_admin.php",
  personalAdmin: "personal_admin.php",
  programacionViajes: "Programacion_viajes.php",
  reparacionesRuta: "roadside_repairs.php",
  safety: "safety.php",
  serviceOrder: "service_order.php",
  teams: "teams.php",
  tracking: "Tracking.php",
  trips: "trips.php",
  trucks: "trucks.php",
  trucksDocs: "trucks_docs.php",
  updateInvoices: "update_invoices.php",
  warehouses: "warehouses.php",
}
