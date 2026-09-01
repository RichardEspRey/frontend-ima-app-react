import { describe, it, expect } from "vitest"
import {
  esNuevo,
  idParaGuardar,
  normalizarTipoDocumento,
  nombreDeArchivo,
  documentosDeEtapa,
  paradasDesdeApi,
  metadatosDocumentos,
  paradasParaGuardar,
  etapaParaGuardar,
  etapasEliminadas,
  archivosNuevos,
  etapasDesdeApi,
} from "../model/edicion"

const sinFormato = (fecha) => (fecha ? "2026-09-01" : null)

describe("ids provisionales", () => {
  it("reconoce los ids creados en el navegador", () => {
    expect(esNuevo("new-1")).toBe(true)
    expect(esNuevo("new_stop_3")).toBe(true)
    expect(esNuevo("482")).toBe(false)
    expect(esNuevo(482)).toBe(false)
  })

  it("un id provisional viaja como null", () => {
    expect(idParaGuardar("new-1")).toBeNull()
    expect(idParaGuardar("482")).toBe("482")
  })

  it("un id ausente no se confunde con uno nuevo", () => {
    expect(esNuevo(null)).toBe(false)
    expect(esNuevo(undefined)).toBe(false)
  })
})

describe("normalizarTipoDocumento", () => {
  it("corrige la llave vieja de orden de retiro", () => {
    expect(normalizarTipoDocumento("orden_de_retiro")).toBe("orden_retiro")
  })

  it("deja intactos los demás tipos", () => {
    expect(normalizarTipoDocumento("bill_of_lading")).toBe("bill_of_lading")
  })
})

describe("nombreDeArchivo", () => {
  it("corta rutas de Unix y de Windows", () => {
    expect(nombreDeArchivo("/var/www/docs/bl.pdf")).toBe("bl.pdf")
    expect(nombreDeArchivo("C:\\docs\\bl.pdf")).toBe("bl.pdf")
  })

  it("sin ruta devuelve el texto por omisión", () => {
    expect(nombreDeArchivo(null)).toBe("Archivo existente")
    expect(nombreDeArchivo("", "Archivo")).toBe("Archivo")
  })
})

describe("documentosDeEtapa", () => {
  const plantilla = { bill_of_lading: null, orden_retiro: null }

  it("coloca cada adjunto en su tipo", () => {
    const docs = documentosDeEtapa(plantilla, [
      { tipo_documento: "bill_of_lading", nombre_archivo: "/x/bl.pdf", document_id: "9" },
    ])
    expect(docs.bill_of_lading.fileName).toBe("bl.pdf")
    expect(docs.bill_of_lading.document_id).toBe("9")
    expect(docs.orden_retiro).toBeNull()
  })

  it("un documento con la llave vieja sigue apareciendo", () => {
    const docs = documentosDeEtapa(plantilla, [
      { tipo_documento: "orden_de_retiro", nombre_archivo: "orden.pdf" },
    ])
    expect(docs.orden_retiro.fileName).toBe("orden.pdf")
  })

  it("ignora tipos que la etapa ya no contempla", () => {
    const docs = documentosDeEtapa(plantilla, [{ tipo_documento: "carta_porte", nombre_archivo: "c.pdf" }])
    expect(docs).not.toHaveProperty("carta_porte")
  })

  it("no escribe sobre propiedades heredadas de Object", () => {
    const docs = documentosDeEtapa(plantilla, [{ tipo_documento: "constructor", nombre_archivo: "x.pdf" }])
    expect(typeof docs.constructor).toBe("function")
  })

  it("sin adjuntos devuelve la plantilla intacta", () => {
    expect(documentosDeEtapa(plantilla)).toEqual(plantilla)
    expect(documentosDeEtapa(plantilla, null)).toEqual(plantilla)
  })
})

describe("paradasDesdeApi", () => {
  it("convierte el documento firmado de cada parada", () => {
    const paradas = paradasDesdeApi([
      { stop_id: "5", location: "Laredo", bl_firmado_doc: { nombre_archivo: "/x/f.pdf", document_id: "3" } },
    ])
    expect(paradas[0].bl_firmado_doc.fileName).toBe("f.pdf")
    expect(paradas[0].bl_firmado_doc.hasNewFile).toBe(false)
    expect(paradas[0].location).toBe("Laredo")
  })

  it("una parada sin documento se queda en null", () => {
    expect(paradasDesdeApi([{ stop_id: "5" }])[0].bl_firmado_doc).toBeNull()
  })

  it("tolera que no vengan paradas", () => {
    expect(paradasDesdeApi()).toEqual([])
    expect(paradasDesdeApi(null)).toEqual([])
  })
})

describe("metadatosDocumentos", () => {
  it("solo describe los tipos que tienen archivo", () => {
    const meta = metadatosDocumentos({
      bill_of_lading: { fileName: "bl.pdf", document_id: "9", hasNewFile: false },
      orden_retiro: null,
      carta_porte: { fileName: "" },
    })
    expect(meta).toHaveLength(1)
    expect(meta[0].tipo_documento).toBe("bill_of_lading")
  })

  it("sin documentos devuelve lista vacía", () => {
    expect(metadatosDocumentos()).toEqual([])
  })
})

describe("paradasParaGuardar", () => {
  it("renumera el orden por la posición en pantalla", () => {
    const paradas = paradasParaGuardar([
      { stop_id: "7", stop_order: 3 },
      { stop_id: "new-1", stop_order: 9 },
    ])
    expect(paradas.map((p) => p.stop_order)).toEqual([1, 2])
  })

  it("las paradas nuevas van sin id", () => {
    expect(paradasParaGuardar([{ stop_id: "new-1" }])[0].stop_id).toBeNull()
  })
})

describe("etapaParaGuardar", () => {
  it("manda null en el id de una etapa nueva", () => {
    const etapa = etapaParaGuardar({ trip_stage_id: "new-2", stage_number: 1 }, sinFormato)
    expect(etapa.trip_stage_id).toBeNull()
    expect(etapa.stage_number).toBe(1)
  })

  it("formatea las fechas con la función que se le pasa", () => {
    const etapa = etapaParaGuardar({ trip_stage_id: "1", loading_date: new Date(), delivery_date: null }, sinFormato)
    expect(etapa.loading_date).toBe("2026-09-01")
    expect(etapa.delivery_date).toBeNull()
  })

  it("incluye la fecha de salida, que solo usan las pantallas de edición", () => {
    const conSalida = etapaParaGuardar({ trip_stage_id: "1", date_of_departure: new Date() }, sinFormato)
    expect(conSalida.date_of_departure).toBe("2026-09-01")
  })

  it("una etapa sin fecha de salida la manda nula, y el cliente la omite", () => {
    const sinSalida = etapaParaGuardar({ trip_stage_id: "1" }, sinFormato)
    expect(sinSalida.date_of_departure).toBeNull()
  })
})

describe("etapasEliminadas", () => {
  it("detecta la etapa que el usuario quitó", () => {
    expect(etapasEliminadas([{ trip_stage_id: "1" }, { trip_stage_id: "2" }], [{ trip_stage_id: "1" }]))
      .toEqual(["2"])
  })

  it("no reporta nada si no se quitó ninguna", () => {
    expect(etapasEliminadas([{ trip_stage_id: "1" }], [{ trip_stage_id: "1" }])).toEqual([])
  })

  it("compara ids aunque cambien de tipo entre carga y edición", () => {
    expect(etapasEliminadas([{ trip_stage_id: 1 }], [{ trip_stage_id: "1" }])).toEqual([])
  })

  it("una etapa nueva no puede aparecer como eliminada", () => {
    expect(etapasEliminadas([], [{ trip_stage_id: "new-1" }])).toEqual([])
  })
})

describe("archivosNuevos", () => {
  const archivo = new File(["x"], "bl.pdf", { type: "application/pdf" })

  it("solo manda los archivos recién escogidos", () => {
    const campos = archivosNuevos([
      {
        documentos: {
          bill_of_lading: { hasNewFile: true, file: archivo },
          orden_retiro: { hasNewFile: false, fileName: "viejo.pdf" },
        },
      },
    ])
    expect(Object.keys(campos)).toEqual(["etapa_0_doc_type_bill_of_lading_file"])
  })

  it("un reemplazo lleva el id del documento que sustituye", () => {
    const campos = archivosNuevos([
      { documentos: { bill_of_lading: { hasNewFile: true, file: archivo, document_id: "9" } } },
    ])
    expect(campos.etapa_0_doc_type_bill_of_lading_replace_id).toBe("9")
  })

  it("nombra los archivos de paradas por etapa y por parada", () => {
    const campos = archivosNuevos([
      { documentos: {}, stops_in_transit: [{}, { bl_firmado_doc: { hasNewFile: true, file: archivo } }] },
    ])
    expect(campos).toHaveProperty("etapa_0_stop_1_bl_firmado_file")
  })

  it("sin archivos nuevos no manda nada", () => {
    expect(archivosNuevos([{ documentos: {} }])).toEqual({})
    expect(archivosNuevos()).toEqual({})
  })
})

describe("etapasDesdeApi", () => {
  const conversores = {
    plantillaDocumentos: (tipo) =>
      tipo === "borderCrossing" ? { orden_retiro: null } : { bill_of_lading: null },
    parsearFecha: (texto) => new Date(`${texto}T00:00:00`),
    pais: "US",
  }

  it("usa la plantilla del tipo de etapa", () => {
    const [normal, cruce] = etapasDesdeApi(
      [{ trip_stage_id: "1" }, { trip_stage_id: "2", stageType: "borderCrossing" }],
      conversores,
    )
    expect(normal.stageType).toBe("normalTrip")
    expect(normal.documentos).toHaveProperty("bill_of_lading")
    expect(cruce.documentos).toHaveProperty("orden_retiro")
  })

  it("convierte las fechas y deja null las que no vienen", () => {
    const [etapa] = etapasDesdeApi([{ loading_date: "2026-09-15", delivery_date: null }], conversores)
    expect(etapa.loading_date).toBeInstanceOf(Date)
    expect(etapa.delivery_date).toBeNull()
  })

  it("conserva los campos que no toca", () => {
    const [etapa] = etapasDesdeApi([{ origin: "Laredo", rate_tarifa: "1200" }], conversores)
    expect(etapa.origin).toBe("Laredo")
    expect(etapa.rate_tarifa).toBe("1200")
  })

  it("nunca deja null en los campos de texto libre", () => {
    const [etapa] = etapasDesdeApi([{ comments: null, invoice_number: null }], conversores)
    expect(etapa.comments).toBe("")
    expect(etapa.invoice_number).toBe("")
  })

  it("sin etapas devuelve lista vacía", () => {
    expect(etapasDesdeApi(undefined, conversores)).toEqual([])
    expect(etapasDesdeApi(null, conversores)).toEqual([])
  })
})
