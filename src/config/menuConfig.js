export const menuItemsConfig = [
  {
    name: "Inicio",
    featureKey: "inicio",
    route: "/home",
    rolesPermitidos: ["admin"],
  },
  {
    name: "Mapa",
    featureKey: "mapa",
    route: "/tracking",
    rolesPermitidos: ["admin"],
  },
  {
    name: "Reports",
    featureKey: "reports",
    route: "/reports",
    rolesPermitidos: ["admin"],
  },

  {
    name: "IMA Manager",
    featureKey: "ima_manager",
    rolesPermitidos: ["admin", "Angeles"],
    subItems: [
      {
        name: "Documentos",
        featureKey: "ima_documentos",
        route: "/ima-manager",
        rolesPermitidos: ["admin"],
      },
      {
        name: "Conductores",
        featureKey: "ima_conductores",
        route: "/admin-drivers",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Camiones",
        featureKey: "ima_camiones",
        route: "/admin-trucks",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Cajas",
        featureKey: "ima_cajas",
        route: "/admin-trailers",
        rolesPermitidos: ["admin", "Angeles"],
      },
    ],
  },

  {
    name: "Gastos",
    featureKey: "gastos",
    rolesPermitidos: ["admin", "Angeles", "Blanca", "Candy", "Mia"],
    subItems: [
      /*{
        name: "Nuevo Gasto",
        featureKey: "gastos_nuevo",
        route: "/new-expense",
        rolesPermitidos: ["admin", "Angeles", "Mia"],
      },*/
      {
        name: "Administrador gastos",
        featureKey: "gastos_admin_general",
        route: "/admin-gastos-generales",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Gastos diesel",
        featureKey: "gastos_diesel",
        route: "/admin-diesel",
        rolesPermitidos: ["admin", "Blanca", "Candy", "Mia"],
      },
      {
        name: "Gastos viajes",
        featureKey: "gastos_viajes",
        route: "/admin-gastos",
        rolesPermitidos: ["admin", "Blanca", "Mia"],
      },
    ],
  },

  {
    name: "Mantenimientos",
    featureKey: "mantenimientos",
    rolesPermitidos: ["admin", "Angeles", "Candy"],
    subItems: [
      {
        name: "Inventario",
        featureKey: "mant_inventario",
        route: "/view-inventory",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
      {
        name: "Inspeccion final",
        featureKey: "mant_inspeccion_final",
        route: "/Inspeccion-final",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
      {
        name: "Administrador Ordenes de Servicio",
        featureKey: "mant_ordenes_servicio",
        route: "/admin-service-order",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
      {
        name: "Autonomías",
        featureKey: "mant_autonomias",
        route: "/autonomia",
        rolesPermitidos: ["admin", "dev", "Angeles", "Candy"],
      },
      {
        name: "Afinaciones",
        featureKey: "mant_afinaciones",
        route: "/afinaciones",
        rolesPermitidos: ["admin", "dev", "Angeles", "Candy"],
      },
      {
        name: "Reparaciones en ruta",
        featureKey: "mant_reparaciones",
        route: "/road-repairs",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
      {
        name: "Inspecciones operativas",
        featureKey: "mant_inspecciones_operativas",
        route: "/inspecciones",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
    ],
  },

  {
    name: "Viajes",
    featureKey: "viajes",
    rolesPermitidos: ["dev", "admin", "Candy", "Blanca"],
    subItems: [
      {
        name: "Cotizador",
        featureKey: "viajes_cotizador",
        route: "/cotizador",
        rolesPermitidos: ["admin"],
      },
      {
        name: "Crear viaje",
        featureKey: "viajes_crear",
        route: "/CrearViaje",
        hideInSidebar: true,
        rolesPermitidos: ["admin"],
      },
      {
        name: "Administrador de viajes",
        featureKey: "viajes_admin",
        route: "/admin-trips",
        rolesPermitidos: ["admin", "Blanca", "Candy", "Mia"],
      },
      {
        name: "Ver Pestaña Upcoming",
        featureKey: "viajes_tab_upcoming",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
      {
        name: "Ver Pestaña Despacho",
        featureKey: "viajes_tab_despacho",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
      {
        name: "Ver Pestaña En Ruta",
        featureKey: "viajes_tab_en_ruta",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
      {
        name: "Ver Pestaña Completados",
        featureKey: "viajes_tab_completados",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
    ],
  },

  {
    name: "Safety",
    featureKey: "safety",
    rolesPermitidos: ["admin"],
    subItems: [
      {
        name: "General",
        featureKey: "safety_general",
        route: "/safety",
        rolesPermitidos: ["admin", "dev"],
      },
      {
        name: "IFTA",
        featureKey: "safety_ifta",
        route: "/Ifta",
        rolesPermitidos: ["admin"],
      },
    ],
  },

  {
    name: "Finanzas",
    featureKey: "finanzas",
    rolesPermitidos: ["admin"],
    subItems: [
      {
        name: "Nómina",
        featureKey: "finanzas_nomina",
        route: "/nomina",
        rolesPermitidos: ["admin", "dev"],
      },
      {
        name: "Pagos",
        featureKey: "finanzas_pagos",
        route: "/paymentDrivers",
        rolesPermitidos: ["admin", "dev"],
      },
      {
        name: "Ventas",
        featureKey: "finanzas_ventas",
        route: "/finanzas",
        rolesPermitidos: ["admin"],
      },
      {
        name: "Margen",
        featureKey: "finanzas_margen",
        route: "/margen",
        rolesPermitidos: ["admin", "dev"],
      },
    ],
  },
];
