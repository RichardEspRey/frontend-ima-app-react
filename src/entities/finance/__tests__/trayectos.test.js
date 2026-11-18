import { describe, expect, it } from "vitest"
import {
  clavePago,
  destinosDe,
  esquemaAsignacionTrayecto,
  esquemaTrayecto,
  nombreDeTrayecto,
  paisesPermitidos,
  trayectosPorCrear,
  pesos,
  sugerirTrayecto,
} from "../model/trayectos"

const CATALOGO = [
  { id: "1", nombre: "Apodaca", monto: 3500, activo: true },
  { id: "2", nombre: "Gómez Palacio", monto: 0, activo: true },
  { id: "3", nombre: "Escobedo", monto: 2800, activo: false },
]

describe("sugerirTrayecto", () => {
  it("reconoce el destino aunque venga sin acento, con punto o con otra abreviatura", () => {
    expect(sugerirTrayecto(["Apodaca, NL."], CATALOGO)?.id).toBe("1")
    expect(sugerirTrayecto(["Apodaca NL"], CATALOGO)?.id).toBe("1")
    expect(sugerirTrayecto(["Gomez Palacios, DGO."], CATALOGO)?.id).toBe("2")
  })

  it("toma el primer destino del recorrido que coincide", () => {
    expect(sugerirTrayecto(["Gomez Palacio, DGO", "Apodaca, NL"], CATALOGO)?.id).toBe("2")
    expect(sugerirTrayecto(["Nuevo Laredo, Tamps.", "Apodaca, NL"], CATALOGO)?.id).toBe("1")
  })

  it("no sugiere trayectos desactivados ni inventa uno", () => {
    expect(sugerirTrayecto(["Escobedo, NL"], CATALOGO)).toBeNull()
    expect(sugerirTrayecto(["Santa Catarina, NLE"], CATALOGO)).toBeNull()
    expect(sugerirTrayecto([], CATALOGO)).toBeNull()
  })
})

describe("destinosDe", () => {
  it("separa el recorrido del servidor y quita los vacíos", () => {
    expect(destinosDe("Apodaca, NL | Nuevo Laredo, TAMPS|")).toEqual(["Apodaca, NL", "Nuevo Laredo, TAMPS"])
    expect(destinosDe(null)).toEqual([])
  })
})

describe("esquemas", () => {
  it("normaliza un trayecto de PHP", () => {
    expect(esquemaTrayecto.parse({ id: 1, nombre: "Apodaca", monto: "3500.00", activo: "1" })).toEqual({
      id: "1",
      nombre: "Apodaca",
      monto: 3500,
      activo: true,
    })
  })

  it("normaliza la asignación de un pago", () => {
    const fila = esquemaAsignacionTrayecto.parse({ trip_id: "584", driver_id: "31", trayecto_id: "1", trayecto: "Apodaca", monto: "3500.00" })
    expect(clavePago(fila.trip_id, fila.driver_id)).toBe("584-31")
    expect(fila.monto).toBe(3500)
  })
})

describe("pesos", () => {
  it("formatea en pesos mexicanos", () => {
    expect(pesos(3500)).toMatch(/3,500\.00/)
  })
})

describe("paisesPermitidos", () => {
  it("el administrador ve los dos", () => {
    expect(paisesPermitidos({ finanzas_pagos_us: false, finanzas_pagos_mx: false }, true)).toEqual(["US", "MX"])
  })

  it("cada quien ve solo el país que tiene encendido", () => {
    expect(paisesPermitidos({ finanzas_pagos_us: true, finanzas_pagos_mx: false })).toEqual(["US"])
    expect(paisesPermitidos({ finanzas_pagos_us: false, finanzas_pagos_mx: true })).toEqual(["MX"])
    expect(paisesPermitidos({ finanzas_pagos_us: false, finanzas_pagos_mx: false })).toEqual([])
  })

  it("mientras los permisos no existan en el servidor, nadie pierde la pantalla", () => {
    expect(paisesPermitidos({ finanzas_pagos: true })).toEqual(["US", "MX"])
    expect(paisesPermitidos(undefined)).toEqual(["US", "MX"])
  })
})

const CATALOGO_MX = [
  { id: '1', nombre: 'Apodaca', monto: 3500, activo: true },
  { id: '2', nombre: 'Gómez Palacio', monto: 6000, activo: true },
  { id: '3', nombre: 'Escobedo', monto: 2800, activo: false },
];

describe('sugerirTrayecto con destinos reales', () => {
  it('reconoce el trayecto aunque el destino venga escrito distinto', () => {
    expect(sugerirTrayecto(['Apodaca, NL.', 'Nuevo Laredo, Tamps.'], CATALOGO_MX).id).toBe('1');
    expect(sugerirTrayecto(['Gomez Palacios, DGO.', 'Nuevo Laredo, TAMPS'], CATALOGO_MX).id).toBe('2');
  });

  it('no sugiere un trayecto dado de baja', () => {
    expect(sugerirTrayecto(['Escobedo, NL'], CATALOGO_MX)).toBeNull();
  });

  it('prefiere el destino real sobre Nuevo Laredo, aunque Nuevo Laredo vaya primero', () => {
    const conBase = [...CATALOGO_MX, { id: '9', nombre: 'Nuevo Laredo', monto: 0, activo: true }];
    expect(sugerirTrayecto(['Nuevo Laredo, Tamps.', 'Apodaca, NL'], conBase).id).toBe('1');
    expect(sugerirTrayecto(['Nuevo Laredo, Tamps.'], conBase).id).toBe('9');
  });
});

describe('nombreDeTrayecto', () => {
  it('toma la ciudad del primer destino que no es Nuevo Laredo', () => {
    expect(nombreDeTrayecto(['Santa Catarina, NL', 'Nuevo Laredo, Tamps.'])).toBe('Santa Catarina');
    expect(nombreDeTrayecto(['Nuevo Laredo, Tamps.', 'San Nicolás de los Garza, NL.'])).toBe('San Nicolás de los Garza');
    expect(nombreDeTrayecto(['Saltillo, COH.'])).toBe('Saltillo');
    expect(nombreDeTrayecto(['Cadereyta Jimenez, NL.'])).toBe('Cadereyta Jimenez');
  });

  it('si el viaje solo va a Nuevo Laredo, el trayecto es Nuevo Laredo', () => {
    expect(nombreDeTrayecto(['Nuevo Laredo, Tamps.'])).toBe('Nuevo Laredo');
  });

  it('sin recorrido no hay nombre', () => {
    expect(nombreDeTrayecto([])).toBe('');
  });
});

describe('trayectosPorCrear', () => {
  it('solo propone los destinos que no coinciden con ningún trayecto', () => {
    const viajes = [
      { recorrido: ['Apodaca, NL', 'Nuevo Laredo, TAMPS'] },
      { recorrido: ['Santa Catarina, NL', 'Nuevo Laredo, Tamps.'] },
      { recorrido: ['Monterrey, NL'] },
    ];
    expect(trayectosPorCrear(viajes, CATALOGO_MX)).toEqual(['Santa Catarina', 'Monterrey']);
  });

  it('no repite un destino aunque venga escrito de varias formas', () => {
    const viajes = [{ recorrido: ['Monterrey, NL'] }, { recorrido: ['Monterrey, Nuevo León'] }, { recorrido: ['monterrey'] }];
    expect(trayectosPorCrear(viajes, CATALOGO_MX)).toEqual(['Monterrey']);
  });

  it('no vuelve a crear uno que existe pero está dado de baja', () => {
    expect(trayectosPorCrear([{ recorrido: ['Escobedo, NL'] }], CATALOGO_MX)).toEqual([]);
  });

  it('ignora los viajes sin recorrido', () => {
    expect(trayectosPorCrear([{ recorrido: [] }, {}], CATALOGO_MX)).toEqual([]);
  });
});
