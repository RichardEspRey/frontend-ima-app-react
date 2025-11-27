export const menuItemsConfig = [
  { name: "Inicio", route: "/home", rolesPermitidos: ["admin"] },
  { name: "Mapa", route: "/tracking", rolesPermitidos: ["admin"] },
  {
    name: "IMA",
    rolesPermitidos: ["admin"],
    subItems: [
      {
        name: "Alta de documentos",
        route: "/ImaScreen",
        rolesPermitidos: ["admin"],
      },
      {
        name: "Administrador de documentos",
        route: "/ImaAdmin",
        rolesPermitidos: ["admin"],
      },
    ],
  },

  {
    name: "Conductores",
    rolesPermitidos: ["admin", "Angeles"],
    subItems: [
      {
        name: "Alta de conductores",
        route: "/drivers",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Administrador de conductores",
        route: "/admin-drivers",
        rolesPermitidos: ["admin", "Angeles"],
      },
    ],
  },

  {
    name: "Camiones",
    rolesPermitidos: ["admin", "Angeles"],
    subItems: [
      {
        name: "Alta de camiones",
        route: "/trucks",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Administrador de camiones",
        route: "/admin-trucks",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Alta de Cajas",
        route: "/trailers",
        rolesPermitidos: ["admin", "Angeles"],
      },
      {
        name: "Administrador de cajas",
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
    ],
  },

  {
    name: "Viajes",
    rolesPermitidos: ["dev", "admin", "Candy", "Blanca"],
    subItems: [
      {
        name: "Nuevo Viaje",
        route: "/trips",
        rolesPermitidos: ["admin", "Blanca"],
      },
      {
        name: "Nuevo Viaje New",
        route: "/trips-new",
        rolesPermitidos: ["dev"],
      },
      {
        name: "Administrador de viajes",
        route: "/admin-trips",
        rolesPermitidos: ["admin", "Blanca", "Candy", "Mia"],
      },
    ],
  },

  {
    name: "Finanzas",
    rolesPermitidos: ["admin"],
    subItems: [
      { name: "Ventas", route: "/finanzas", rolesPermitidos: ["admin"] },
      { name: "Margen", route: "/margen", rolesPermitidos: ["admin", "dev"] },
    ],
  },

  { name: "Reports", route: "/reports", rolesPermitidos: ["admin"] },


];
