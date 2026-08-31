import { describe, it, expect } from "vitest"
import { ROLES, normalizarRol, PERMISOS_POR_ROL, ROLES_TOTALES } from "../roles"
import { PERMISOS, TODOS_LOS_PERMISOS } from "../permisos"
import { calcularPermisosEfectivos, crearComprobador } from "../permisosEfectivos"

describe("normalizarRol", () => {
  it("mapea los tres valores que existen hoy en producción", () => {
    expect(normalizarRol("Admin")).toBe(ROLES.ADMINISTRADOR)
    expect(normalizarRol("Administrativo")).toBe(ROLES.ADMINISTRATIVO)
    expect(normalizarRol("Driver")).toBe(ROLES.OPERADOR)
  })

  it("no distingue mayúsculas ni espacios sobrantes", () => {
    expect(normalizarRol("  ADMIN ")).toBe(ROLES.ADMINISTRADOR)
    expect(normalizarRol("aDmInIsTrAtIvO")).toBe(ROLES.ADMINISTRATIVO)
  })

  it("acepta el nombre nuevo y el viejo del mismo rol", () => {
    expect(normalizarRol("Driver")).toBe(normalizarRol("Operador"))
    expect(normalizarRol("Admin")).toBe(normalizarRol("Administrador"))
  })

  it("un rol desconocido cae al de MENOR privilegio, no al mayor", () => {
    for (const entrada of ["Gerente", "", null, undefined, 0, "Administrador2", "admin_general"]) {
      const rol = normalizarRol(entrada)
      expect(ROLES_TOTALES.has(rol)).toBe(false)
    }
    expect(normalizarRol("Gerente")).toBe(ROLES.CONSULTA)
  })

  it("pero un espacio sobrante SÍ se reconoce: es error de captura, no otro rol", () => {
    expect(normalizarRol("admin ")).toBe(ROLES.ADMINISTRADOR)
    expect(normalizarRol(" Driver")).toBe(ROLES.OPERADOR)
  })

  it("nunca devuelve algo fuera del catálogo", () => {
    const validos = new Set(Object.values(ROLES))
    for (const entrada of ["Admin", "x", null, 42, {}, []]) {
      expect(validos.has(normalizarRol(entrada))).toBe(true)
    }
  })
})

describe("calcularPermisosEfectivos", () => {
  it("el Administrador ve todo", () => {
    const efectivos = calcularPermisosEfectivos(ROLES.ADMINISTRADOR)
    expect(efectivos.size).toBe(TODOS_LOS_PERMISOS.length)
  })

  it("a un rol total no le pueden quitar permisos por ajustes de usuario", () => {
    const efectivos = calcularPermisosEfectivos(ROLES.ADMINISTRADOR, {
      [PERMISOS.FINANZAS]: false,
      [PERMISOS.VIAJES]: false,
    })
    expect(efectivos.has(PERMISOS.FINANZAS)).toBe(true)
  })

  it("el paquete del rol se aplica sin ajustes", () => {
    const efectivos = calcularPermisosEfectivos(ROLES.FINANZAS)
    expect(efectivos.has(PERMISOS.FINANZAS_NOMINA)).toBe(true)
    expect(efectivos.has(PERMISOS.MANT_AFINACIONES)).toBe(false)
  })

  it("un ajuste en true concede algo que el rol no traía", () => {
    const efectivos = calcularPermisosEfectivos(ROLES.FINANZAS, {
      [PERMISOS.MANT_AFINACIONES]: true,
    })
    expect(efectivos.has(PERMISOS.MANT_AFINACIONES)).toBe(true)
  })

  it("un ajuste en false quita algo que el rol sí traía", () => {
    const efectivos = calcularPermisosEfectivos(ROLES.FINANZAS, {
      [PERMISOS.FINANZAS_NOMINA]: false,
    })
    expect(efectivos.has(PERMISOS.FINANZAS_NOMINA)).toBe(false)
  })

  it("el Operador no trae nada de escritorio: los conductores usan la móvil", () => {
    expect(calcularPermisosEfectivos(ROLES.OPERADOR).size).toBe(0)
  })

  it("un rol desconocido no concede nada", () => {
    expect(calcularPermisosEfectivos("inventado").size).toBe(0)
  })

  it("MIGRACIÓN: un Administrativo conserva exactamente lo que hoy le dan sus flags", () => {
    const flagsDeHoy = {
      [PERMISOS.INICIO]: true,
      [PERMISOS.GASTOS]: true,
      [PERMISOS.GASTOS_DIESEL]: true,
      [PERMISOS.VIAJES]: true,
      [PERMISOS.VIAJES_TAB_EN_RUTA]: true,
      [PERMISOS.FINANZAS]: false,
    }
    const efectivos = calcularPermisosEfectivos(ROLES.ADMINISTRATIVO, flagsDeHoy)
    const esperados = Object.entries(flagsDeHoy)
      .filter(([, v]) => v)
      .map(([k]) => k)

    expect([...efectivos].sort()).toEqual(esperados.sort())
  })
})

describe("crearComprobador", () => {
  it("responde según los permisos efectivos", () => {
    const can = crearComprobador(new Set([PERMISOS.GASTOS]))
    expect(can(PERMISOS.GASTOS)).toBe(true)
    expect(can(PERMISOS.FINANZAS)).toBe(false)
  })

  it("un permiso vacío nunca pasa, salvo rol total", () => {
    expect(crearComprobador(new Set())(undefined)).toBe(false)
    expect(crearComprobador(new Set())("")).toBe(false)
  })

  it("el rol total pasa cualquier cosa", () => {
    const can = crearComprobador(new Set(), true)
    expect(can(PERMISOS.FINANZAS_NOMINA)).toBe(true)
  })
})

describe("catálogo", () => {
  it("todos los permisos de todos los roles existen en el catálogo", () => {
    const validos = new Set(TODOS_LOS_PERMISOS)
    for (const [rol, permisos] of Object.entries(PERMISOS_POR_ROL)) {
      for (const permiso of permisos) {
        expect(validos.has(permiso), `${rol} declara un permiso inexistente: ${permiso}`).toBe(true)
      }
    }
  })

  it("ningún rol que no sea Administrador trae todos los permisos por accidente", () => {
    for (const [rol, permisos] of Object.entries(PERMISOS_POR_ROL)) {
      if (ROLES_TOTALES.has(rol)) continue
      expect(new Set(permisos).size).toBeLessThan(TODOS_LOS_PERMISOS.length)
    }
  })
})
