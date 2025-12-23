export const initialBorderCrossingDocs = {
  ima_invoice: null,
  doda: null,
  ci: null,
  entry: null,
  manifiesto: null,
  bl: null,
  orden_retiro: null,
  bl_firmado: null,
};

export const initialNormalTripDocs = {
  ima_invoice: null,
  ci: null,
  bl: null,
  bl_firmado: null,
};

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
