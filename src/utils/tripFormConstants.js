export const initialBorderCrossingDocs = {
  ima_invoice: null,
  doda: null,
  ci: null,
  entry: null,
  manifiesto: null,
  bl: null,
  orden_retiro: null,
  bl_firmado: null,
  DTOPS: null,
  qr_manifesto: null,
};

export const initialNormalTripDocs = {
  ima_invoice: null,
  ci: null,
  bl: null,
  bl_firmado: null,
  qr_manifesto: null,
};

export const NORMAL_TRIP_DOCS_BY_COUNTRY = {
  US: {
    ima_invoice: null,
    doda: null,
    ci: null,
    entry: null,
    manifiesto: null,
    bl: null,
    bl_firmado: null,
    orden_retiro: null,
    qr_manifesto: null,
    DTOPS: null,
  },
  MX: {
    carta_porte: null,
    fianza: null,
    qr_manifesto: null,
  },
};

// Documentos guardados con una llave vieja, para que sigan viéndose en su ranura.
//
// `bl_firmado_doc` no está aquí a propósito: son quince documentos que se
// guardaron con la llave interna del formulario, pero en las quince etapas ya
// existe además el `bl_firmado` bueno y la parada ya tiene el suyo. Traerlos a
// la ranura de BL Firmado taparía el documento correcto para mostrar una copia
// vieja. Se quedan fuera del editor y siguen a la vista en la tarjeta del
// Administrador de viajes, entre los otros documentos.
const ALIAS_TIPO_DOCUMENTO = {
  orden_de_retiro: "orden_retiro",
};

export const normalizeDocType = (tipo) => ALIAS_TIPO_DOCUMENTO[tipo] || tipo;

// Lo que el escritorio admite al subir un documento de viaje. Los operadores
// mandan fotos del BL desde la app móvil, así que pedir solo PDF aquí dejaba a
// la oficina sin poder subir ni reemplazar ese mismo documento.
export const TIPOS_DOCUMENTO_VIAJE = "application/pdf,image/jpeg,image/png";

const EXTENSIONES_IMAGEN = /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i;

export const esImagen = (nombreOUrl) => EXTENSIONES_IMAGEN.test(String(nombreOUrl || ""));

export const selectStyles = {
  control: (provided) => ({
    ...provided,
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #c4c4c4",
    fontSize: "15px",
    minHeight: "45px",
    backgroundColor: "#fff",
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

export const getDocumentUrl = (doc, apiHost) => {
  if (!doc) return "#";
  if (doc.file instanceof File) return URL.createObjectURL(doc.file);
  if (doc.serverPath && typeof doc.serverPath === "string") {
    const uploadsWebPath = `${apiHost}/Uploads/Trips/`;
    const fileName = doc.serverPath.split(/[\\/]/).pop();
    if (fileName) return `${uploadsWebPath}${encodeURIComponent(fileName)}`;
  }
  return "#";
};
