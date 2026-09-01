import { describe, it, expect } from "vitest"
import {
  TIPO_USUARIO_API,
  esquemaUsuario,
  normalizarUsuarios,
  estaActivo,
  validarFormularioUsuario,
} from "../model/usuario"
import { ROLES } from "../../../shared/auth/roles"

const USUARIO_API = {
  id: "20",
  driver_id: null,
  name: "Angeles",
  user: "AngelesD",
  pass: "Angeles!",
  type: "Administrativo",
  active: "1",
}

describe("esquemaUsuario", () => {
  it("NUNCA deja pasar la contraseña, aunque la API la mande", () => {
    const u = esquemaUsuario.parse(USUARIO_API)
    expect(u).not.toHaveProperty("pass")
    expect(JSON.stringify(u)).not.toContain("Angeles!")
  })

  it("convierte los campos que PHP manda como cadena", () => {
    const u = esquemaUsuario.parse(USUARIO_API)
    expect(u.active).toBe(1)
    expect(u.id).toBe("20")
  })

  it("exige nombre: sin él la fila no se puede ni pintar", () => {
    expect(esquemaUsuario.safeParse({ id: "1", user: "x" }).success).toBe(false)
  })

  it("tolera driver_id nulo", () => {
    expect(esquemaUsuario.parse(USUARIO_API).driver_id).toBeNull()
  })
})

describe("normalizarUsuarios", () => {
  it("agrega el rol canónico a partir del type crudo", () => {
    const { usuarios } = normalizarUsuarios([
      { ...USUARIO_API, type: "Admin" },
      { ...USUARIO_API, id: "21", type: "Administrativo" },
      { ...USUARIO_API, id: "22", type: "Driver" },
    ])
    expect(usuarios.map((u) => u.rol)).toEqual([
      ROLES.ADMINISTRADOR,
      ROLES.ADMINISTRATIVO,
      ROLES.OPERADOR,
    ])
  })

  it("conserva el type crudo, porque es lo que viaja de vuelta al backend", () => {
    const { usuarios } = normalizarUsuarios([{ ...USUARIO_API, type: "Admin" }])
    expect(usuarios[0].type).toBe("Admin")
    expect(usuarios[0].rol).toBe(ROLES.ADMINISTRADOR)
  })

  it("trae el nombre del rol listo para mostrar", () => {
    const { usuarios } = normalizarUsuarios([{ ...USUARIO_API, type: "Driver" }])
    expect(usuarios[0].nombreRol).toBe("Operador")
  })

  it("un type desconocido cae al rol de menor privilegio", () => {
    const { usuarios } = normalizarUsuarios([{ ...USUARIO_API, type: "Gerente" }])
    expect(usuarios[0].rol).toBe(ROLES.CONSULTA)
  })

  it("descarta las filas malas y cuenta cuántas", () => {
    const { usuarios, descartados } = normalizarUsuarios([USUARIO_API, { id: "9" }, null])
    expect(usuarios).toHaveLength(1)
    expect(descartados).toBe(2)
  })

  it("ninguna contraseña sobrevive a la normalización", () => {
    const { usuarios } = normalizarUsuarios([USUARIO_API, { ...USUARIO_API, id: "21" }])
    expect(JSON.stringify(usuarios)).not.toContain("Angeles!")
  })
})

describe("estaActivo", () => {
  it("acepta el 1 como número y como cadena", () => {
    expect(estaActivo({ active: 1 })).toBe(true)
    expect(estaActivo({ active: "1" })).toBe(true)
  })

  it("un usuario inactivo o ausente no está activo", () => {
    expect(estaActivo({ active: 0 })).toBe(false)
    expect(estaActivo(undefined)).toBe(false)
  })
})

describe("validarFormularioUsuario", () => {
  const base = { name: "Ana", user: "ana", type: TIPO_USUARIO_API.ADMINISTRATIVO }

  it("acepta un formulario completo", () => {
    expect(validarFormularioUsuario(base).valido).toBe(true)
  })

  it("exige nombre, usuario y tipo", () => {
    expect(validarFormularioUsuario({ ...base, name: "  " }).valido).toBe(false)
    expect(validarFormularioUsuario({ ...base, user: "" }).valido).toBe(false)
    expect(validarFormularioUsuario({ ...base, type: "" }).valido).toBe(false)
  })

  it("al EDITAR, la contraseña vacía es válida: significa no cambiarla", () => {
    expect(validarFormularioUsuario({ ...base, pass: "" }).valido).toBe(true)
  })

  it("al CREAR, la contraseña es obligatoria", () => {
    const r = validarFormularioUsuario({ ...base, pass: "" }, { esAlta: true })
    expect(r.valido).toBe(false)
    expect(r.mensaje).toMatch(/contraseña/i)
  })

  it("un usuario Driver necesita conductor asociado", () => {
    const sinConductor = { ...base, type: TIPO_USUARIO_API.DRIVER }
    expect(validarFormularioUsuario(sinConductor).valido).toBe(false)

    const conConductor = { ...sinConductor, driver_id: "7" }
    expect(validarFormularioUsuario(conConductor).valido).toBe(true)
  })

  it("los demás tipos no necesitan conductor", () => {
    expect(validarFormularioUsuario({ ...base, driver_id: "" }).valido).toBe(true)
  })
})
