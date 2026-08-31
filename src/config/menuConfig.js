/**
 * Estructura del menú lateral.
 *
 * Cada entrada declara su `featureKey`, que es el permiso que la habilita. Ya no
 * hay `rolesPermitidos`: contenía nombres de personas ("Angeles", "Blanca",
 * "Candy", "Mia") y un "dev" que no corresponden a ningún valor de
 * `Users_credentials.type` —los únicos son Admin, Administrativo y Driver—, así
 * que nunca coincidían con nadie. Los permisos los resuelve `shared/auth`.
 */
export const menuItemsConfig = [
  {
    name: "Inicio",
    featureKey: "inicio",
    route: "/home",
  },
  {
    name: "Mapa",
    featureKey: "mapa",
    route: "/tracking",
  },
  {
    name: "Reports",
    featureKey: "reports",
    route: "/reports",
  },

  {
    name: "IMA Manager",
    featureKey: "ima_manager",
    subItems: [
      {
        name: "Documentos",
        featureKey: "ima_documentos",
        route: "/ima-manager",
      },
      {
        name: "Conductores",
        featureKey: "ima_conductores",
        route: "/admin-drivers",
      },
      {
        name: "Camiones",
        featureKey: "ima_camiones",
        route: "/admin-trucks",
      },
      {
        name: "Cajas",
        featureKey: "ima_cajas",
        route: "/admin-trailers",
      },
    ],
  },

  {
    name: "Gastos",
    featureKey: "gastos",
    subItems: [
      /*{
        name: "Nuevo Gasto",
        featureKey: "gastos_nuevo",
        route: "/new-expense",
      },*/
      {
        name: "Administrador gastos",
        featureKey: "gastos_admin_general",
        route: "/admin-gastos-generales",
      },
      {
        name: "Gastos diesel",
        featureKey: "gastos_diesel",
        route: "/admin-diesel",
      },
      {
        name: "Gastos viajes",
        featureKey: "gastos_viajes",
        route: "/admin-gastos",
      },
    ],
  },

  {
    name: "Mantenimientos",
    featureKey: "mantenimientos",
    subItems: [
      {
        name: "Inspeccion final",
        featureKey: "mant_inspeccion_final",
        route: "/Inspeccion-final",
      },
      {
        name: "Administrador Ordenes de Servicio",
        featureKey: "mant_ordenes_servicio",
        route: "/admin-service-order",
      },
      {
        name: "Ver Pestaña Inventario",
        featureKey: "mant_inventario",
        route: "/view-inventory",
        hideInSidebar: true,
        group: "Pestañas del Administrador de Ordenes de Servicio",
      },
      {
        name: "Autonomías",
        featureKey: "mant_autonomias",
        route: "/autonomia",
      },
      {
        name: "Afinaciones",
        featureKey: "mant_afinaciones",
        route: "/afinaciones",
      },
    ],
  },

  {
    name: "Viajes",
    featureKey: "viajes",
    subItems: [
      {
        name: "Cotizador",
        featureKey: "viajes_cotizador",
        route: "/cotizador",
      },
      {
        name: "Crear viaje",
        featureKey: "viajes_crear",
        route: "/CrearViaje",
        hideInSidebar: true,
      },
      {
        name: "Administrador de viajes",
        featureKey: "viajes_admin",
        route: "/admin-trips",
      },
      {
        name: "Ver Pestaña Programacion",
        featureKey: "viajes_tab_programacion",
        route: null,
        hideInSidebar: true,
        group: "Pestañas del Administrador de Viajes",
      },
      {
        name: "Ver Pestaña Upcoming",
        featureKey: "viajes_tab_upcoming",
        route: null,
        hideInSidebar: true,
        group: "Pestañas del Administrador de Viajes",
      },
      {
        name: "Ver Pestaña Despacho",
        featureKey: "viajes_tab_despacho",
        route: null,
        hideInSidebar: true,
        group: "Pestañas del Administrador de Viajes",
      },
      {
        name: "Ver Pestaña En Ruta",
        featureKey: "viajes_tab_en_ruta",
        route: null,
        hideInSidebar: true,
        group: "Pestañas del Administrador de Viajes",
      },
      {
        name: "Ver Pestaña Completados",
        featureKey: "viajes_tab_completados",
        route: null,
        hideInSidebar: true,
        group: "Pestañas del Administrador de Viajes",
      },
      {
        name: "Visibilidad Global de Viajes",
        featureKey: "view_all_trips",
        route: null,
        hideInSidebar: true,
        group: "Permisos Avanzados",
      },
      {
        name: "Gestionar Invoices en Viajes",
        featureKey: "viajes_invoice_fields",
        route: null,
        hideInSidebar: true,
        group: "Permisos Avanzados",
      },
    ],
  },

  {
    name: "Safety",
    featureKey: "safety",
    subItems: [
      {
        name: "General",
        featureKey: "safety_general",
        route: "/safety",
      },
      {
        name: "IFTA",
        featureKey: "safety_ifta",
        route: "/Ifta",
      },
    ],
  },

  {
    name: "Finanzas",
    featureKey: "finanzas",
    subItems: [
      {
        name: "Nómina",
        featureKey: "finanzas_nomina",
        route: "/nomina",
      },
      {
        name: "Pagos",
        featureKey: "finanzas_pagos",
        route: "/paymentDrivers",
      },
      {
        name: "Ventas",
        featureKey: "finanzas_ventas",
        route: "/finanzas",
      },
      {
        name: "Margen",
        featureKey: "finanzas_margen",
        route: "/margen",
      },
    ],
  },
];
