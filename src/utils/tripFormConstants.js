import { COLOR } from "../shared/ui/tokens"
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
  },
  MX: {
    carta_porte: null,
    fianza: null,
    qr_manifesto: null,
  },
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
