export const menuItemsConfig = [
  { name: "Inicio", route: "/home", rolesPermitidos: ["admin"] },
  { name: "Mapa", route: "/tracking", rolesPermitidos: ["admin"] },
  {
    name: "Estatus de Unidades",
    route: "/estatus-unidades",
    rolesPermitidos: ["dev", "admin"],
  },
  {
    name: "IMA Manager",
    rolesPermitidos: ["admin", "Angeles"], // El rol "Angeles" puede ver la pestaña principal
    subItems: [
      {
        name: "Documentos",
        route: "/ima-manager",
        rolesPermitidos: ["admin"], // Solo el admin ve la sección de documentos corporativos
      },
      {
        name: "Conductores",
        route: "/admin-drivers",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Camiones",
        route: "/admin-trucks",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Cajas",
        route: "/admin-trailers",
        rolesPermitidos: ["admin", "Angeles"],
      },
    ],
  },

  {
    name: "Gastos",
    rolesPermitidos: ["admin", "Angeles", "Blanca", "Candy", "Mia"],
    subItems: [
      {
        name: "Nuevo Gasto",
        route: "/new-expense",
        rolesPermitidos: ["admin", "Angeles", "Mia"],
      },
      {
        name: "Administrador gastos",
        route: "/admin-gastos-generales",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Gastos diesel",
        route: "/admin-diesel",
        rolesPermitidos: ["admin", "Blanca", "Candy", "Mia"],
      },
      {
        name: "Gastos viajes",
        route: "/admin-gastos",
        rolesPermitidos: ["admin", "Blanca", "Mia"],
      },
    ],
  },

  {
    name: "Mantenimientos",
    rolesPermitidos: ["admin", "Angeles", "Candy"],
    subItems: [
      {
        name: "Inventario",
        route: "/view-inventory",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
      {
        name: "Inspeccion final",
        route: "/Inspeccion-final",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
      {
        name: "Administrador Ordenes de Servicio",
        route: "/admin-service-order",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
      {
        name: "Autonomías",
        route: "/autonomia",
        rolesPermitidos: ["admin", "dev", "Angeles", "Candy"],
      },
      {
        name: "Afinaciones",
        route: "/afinaciones",
        rolesPermitidos: ["admin", "dev", "Angeles", "Candy"],
      },
      {
        name: "Reparaciones en ruta",
        route: "/road-repairs",
        rolesPermitidos: ["admin", "Angeles", "Candy"],
      },
    ],
  },

  {
    name: "Viajes",
    rolesPermitidos: ["dev", "admin", "Candy", "Blanca"],
    subItems: [
      {
        name: "Cotizador",
        route: "/cotizador",
        rolesPermitidos: ["admin"],
      },
      {
        name: "Crear viaje",
        route: "/CrearViaje",
        rolesPermitidos: ["admin"],
      },
      {
        name: "Nuevo Viaje",
        route: "/trips-new",
        rolesPermitidos: ["dev"],
      },
      {
        name: "Administrador de viajes",
        route: "/admin-trips",
        rolesPermitidos: ["admin", "Blanca", "Candy", "Mia"],
      },
      {
        name: "Ver Pestaña Upcoming",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
      {
        name: "Ver Pestaña Despacho",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
      {
        name: "Ver Pestaña En Ruta",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
      {
        name: "Ver Pestaña Completados",
        route: null,
        hideInSidebar: true,
        rolesPermitidos: ["admin", "Blanca", "Candy"],
      },
    ],
  },

  {
    name: "Safety",
    rolesPermitidos: ["admin"],
    subItems: [
      {
        name: "General",
        route: "/safety",
        rolesPermitidos: ["admin", "dev"],
      },
      { name: "IFTA", route: "/Ifta", rolesPermitidos: ["admin"] },
    ],
  },

  {
    name: "Finanzas",
    rolesPermitidos: ["admin"],
    subItems: [
      {
        name: "Nómina",
        route: "/nomina",
        rolesPermitidos: ["admin", "dev"],
      },
      {
        name: "Pagos",
        route: "/paymentDrivers",
        rolesPermitidos: ["admin", "dev"],
      },
      { name: "Ventas", route: "/finanzas", rolesPermitidos: ["admin"] },
      { name: "Margen", route: "/margen", rolesPermitidos: ["admin", "dev"] },
    ],
  },

  { name: "Reports", route: "/reports", rolesPermitidos: ["admin"] },
];
