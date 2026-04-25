import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";

import useFetchActiveDrivers from "../../../core/hooks/useFetchActiveDrivers";
import useFetchActiveTrucks from "../../../core/hooks/useFetchActiveTrucks";
import useFetchActiveTrailers from "../../../core/hooks/useFetchActiveTrailers";
import useFetchActiveExternalTrailers from "../../../core/hooks/useFetchActiveExternalTrailers";
import useFetchCompanies from "../../../core/hooks/useFetchCompanies";
import useFetchWarehouses from "../../../core/hooks/useFetchWarehouses";

const apiHost = import.meta.env.VITE_API_HOST;

const initialNormalTripDocs = {
  ima_invoice: null,
  ci: null,
  bl: null,
  bl_firmado: null,
  qr_manifesto: null,
};

const initialEtapaStateBase = {
  stage_number: 1,
  company_id: null,
  origin: "",
  zip_code_origin: "",
  loading_date: new Date(),
  warehouse_origin_id: null,
  destination: "",
  zip_code_destination: "",
  delivery_date: new Date(),
  warehouse_destination_id: null,
  travel_direction: "",
  ci_number: "",
  invoice_number: "",
  rate_tarifa: "",
  millas_pcmiller: "",
  millas_pcmiller_practicas: "",
  comments: "",
  documentos: { ...initialNormalTripDocs },
  time_of_delivery: "",
  date_of_departure: new Date(),
  stops_in_transit: [],
};

/**
 * Hook maestro para centralizar la lógica de:
 * - TripFormMX.jsx
 * - TripFormUSA.jsx
 * - BorderCrossingFormNew2.jsx
 *
 * NOTA: Este hook NO impone UI. Solo concentra estado + handlers.
 */
export default function useTripManager({
  // Props base (idénticas a los formularios actuales)
  tripNumber,
  countryCode,
  tripYear,
  isTransnational,
  isContinuation,
  transnationalNumber,
  movementNumber,
  origenId,
  onSuccess,
  etapas: etapasProp,
  setEtapas: setEtapasProp,
  formData: formDataProp,
  setFormData: setFormDataProp,
  onSaveOverride,

  /**
   * Opcional (para soportar el 3er formulario):
   * - TripFormMX/USA inicializan en "normalTrip"
   * - BorderCrossingFormNew2 inicializa en "borderCrossing"
   */
  initialStageType = "normalTrip",
} = {}) {
  // ===== Catálogos (hooks) =====
  const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
  const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
  const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
  const {
    activeExternalTrailers,
    loading: loadingCajasExternas,
    error: errorCajasExternas,
    refetch: refetchExternalTrailers,
  } = useFetchActiveExternalTrailers();
  const { activeCompanies, loading: loadingCompanies } = useFetchCompanies();
  const { activeWarehouses, loading: loadingWarehouses } = useFetchWarehouses();

  // ===== Estado dual (etapas) =====
  const [etapasLocal, setEtapasLocal] = useState(() => [
    { ...initialEtapaStateBase, stageType: initialStageType },
  ]);
  const etapas = etapasProp ?? etapasLocal;
  const setEtapas = setEtapasProp ?? setEtapasLocal;

  // ===== Estado dual (formData) =====
  const [formDataLocal, setFormDataLocal] = useState(() => ({
    trip_number: tripNumber || "",
    driver_id: "",
    driver_id_second: "",
    truck_id: "",
    caja_id: "",
    caja_externa_id: "",
  }));
  const formData = formDataProp ?? formDataLocal;
  const setFormData = setFormDataProp ?? setFormDataLocal;

  const setForm = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // ===== UI/UX flags =====
  const [loadingSave, setLoadingSave] = useState(false);
  const [tripMode, setTripMode] = useState(() =>
    formDataProp?.driver_id_second ? "team" : "individual",
  );
  const [trailerType, setTrailerType] = useState(() =>
    formDataProp?.caja_externa_id ? "externa" : "interna",
  );

  // ===== Modales / documentos =====
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTarget, setModalTarget] = useState({
    stageIndex: null,
    docType: null,
    stopIndex: null,
  });
  const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(false);
  const [isModalCajaExternaOpen, setIsModalCajaExternaOpen] = useState(false);

  // ===== Opciones (selects) + creación =====
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  // ===== Orígenes (catálogo extra) =====
  const [origenes, setOrigenes] = useState([]);

  useEffect(() => {
    const fd = new FormData();
    fd.append("op", "get_origenes");
    fetch(`${apiHost}/new_tripsv2.php`, { method: "POST", body: fd })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setOrigenes(data.data);
      })
      .catch((err) => console.error("Error cargando orígenes:", err));
  }, []);

  useEffect(() => {
    if (activeCompanies) {
      setCompanyOptions(
        activeCompanies.map((c) => ({ value: c.company_id, label: c.nombre_compania })),
      );
    }
  }, [activeCompanies]);

  useEffect(() => {
    if (activeWarehouses) {
      setWarehouseOptions(
        activeWarehouses.map((w) => ({ value: w.warehouse_id, label: w.nombre_almacen })),
      );
    }
  }, [activeWarehouses]);

  useEffect(() => {
    setForm("trip_number", tripNumber || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripNumber]);

  // ===== Etapas =====
  const addStage = (type) => {
    setEtapas((prev) => [
      ...prev,
      { ...initialEtapaStateBase, stage_number: prev.length + 1, stageType: type },
    ]);
  };

  const removeStage = (indexToRemove) => {
    if (etapas.length === 1) {
      return Swal.fire("Aviso", "Mínimo una etapa requerida", "info");
    }
    setEtapas((prev) =>
      prev
        .filter((_, index) => index !== indexToRemove)
        .map((e, index) => ({ ...e, stage_number: index + 1 })),
    );
  };

  const updateStage = (stageIndex, field, value) => {
    setEtapas((prev) => {
      const copy = [...prev];
      copy[stageIndex] = { ...copy[stageIndex], [field]: value };
      return copy;
    });
  };

  const handleEtapaChange = (stageIndex, field, value) => {
    setEtapas((prev) => {
      const copy = [...prev];
      copy[stageIndex] = { ...copy[stageIndex], [field]: value };
      return copy;
    });
  };

  // ===== Paradas =====
  const addStop = (stageIndex) => {
    setEtapas((prev) => {
      const copy = [...prev];
      copy[stageIndex].stops_in_transit = [
        ...(copy[stageIndex].stops_in_transit || []),
        { location: "", time_of_delivery: "", bl_firmado_doc: null },
      ];
      return copy;
    });
  };

  const removeStop = (stageIndex, stopIndex) => {
    setEtapas((prev) => {
      const copy = [...prev];
      copy[stageIndex].stops_in_transit = (copy[stageIndex].stops_in_transit || []).filter(
        (_, idx) => idx !== stopIndex,
      );
      return copy;
    });
  };

  const updateStop = (stageIndex, stopIndex, field, value) => {
    setEtapas((prev) => {
      const copy = [...prev];
      copy[stageIndex].stops_in_transit[stopIndex][field] = value;
      return copy;
    });
  };

  // ===== Documentos =====
  const openDocModal = (stageIndex, docType, stopIndex = null) => {
    setModalTarget({ stageIndex, docType, stopIndex });
    setMostrarFechaVencimientoModal(false);
    setModalAbierto(true);
  };

  const getCurrentDocValueForModal = () => {
    const { stageIndex, docType, stopIndex } = modalTarget;
    if (stageIndex === null) return null;

    if (stopIndex !== null) {
      return etapas[stageIndex].stops_in_transit?.[stopIndex]?.[docType];
    }
    return etapas[stageIndex].documentos?.[docType];
  };

  const handleGuardarDocumentoEtapa = (data) => {
    const { stageIndex, docType, stopIndex } = modalTarget;
    if (stageIndex === null || !docType) return;

    setEtapas((prev) => {
      const up = [...prev];

      if (stopIndex !== null) {
        const stops = [...(up[stageIndex].stops_in_transit || [])];
        const stop = { ...(stops[stopIndex] || {}) };
        stop[docType] = { ...(stop[docType] || {}), ...data };
        stops[stopIndex] = stop;
        up[stageIndex] = { ...up[stageIndex], stops_in_transit: stops };
        return up;
      }

      up[stageIndex] = {
        ...up[stageIndex],
        documentos: {
          ...(up[stageIndex].documentos || {}),
          [docType]: { ...(up[stageIndex].documentos?.[docType] || {}), ...data },
        },
      };
      return up;
    });

    setModalAbierto(false);
    setModalTarget({ stageIndex: null, docType: null, stopIndex: null });
  };

  // ===== Creación (BD) =====
  const handleCreateCompany = async (inputValue, stageIndex) => {
    setIsCreatingCompany(true);
    const fd = new FormData();
    fd.append("op", "CreateCompany");
    fd.append("nombre_compania", inputValue);

    try {
      const res = await fetch(`${apiHost}/companies.php`, { method: "POST", body: fd });
      const result = await res.json();
      if (result.status === "success") {
        const newOption = {
          value: result.company.company_id,
          label: result.company.nombre_compania,
        };
        setCompanyOptions((prev) => [...prev, newOption]);
        handleEtapaChange(stageIndex, "company_id", newOption.value);
        Swal.fire("Éxito", "Compañía creada", "success");
      }
    } catch {
      Swal.fire("Error", "No se pudo crear compañía", "error");
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleCreateWarehouse = async (inputValue, stageIndex, fieldKey) => {
    setIsCreatingWarehouse(true);
    const fd = new FormData();
    fd.append("op", "CreateWarehouse");
    fd.append("nombre_almacen", inputValue);

    try {
      const res = await fetch(`${apiHost}/warehouses.php`, { method: "POST", body: fd });
      const result = await res.json();
      if (result.status === "success") {
        const newOption = {
          value: result.warehouse.warehouse_id,
          label: result.warehouse.nombre_almacen,
        };
        setWarehouseOptions((prev) => [...prev, newOption]);
        handleEtapaChange(stageIndex, fieldKey, newOption.value);
        Swal.fire("Éxito", "Bodega creada", "success");
      }
    } catch {
      Swal.fire("Error", "No se pudo crear bodega", "error");
    } finally {
      setIsCreatingWarehouse(false);
    }
  };

  const handleSaveExternalCaja = async (cajaData) => {
    const dataToSend = new FormData();
    dataToSend.append("op", "Alta");
    Object.entries(cajaData || {}).forEach(([k, v]) => dataToSend.append(k, v));

    try {
      const res = await fetch(`${apiHost}/caja_externa.php`, { method: "POST", body: dataToSend });
      const result = await res.json();
      if (result.status === "success" && result.caja) {
        Swal.fire("¡Éxito!", "Caja externa registrada.", "success");
        setForm("caja_externa_id", result.caja.caja_externa_id);
        setForm("caja_id", "");
        refetchExternalTrailers?.();
        setIsModalCajaExternaOpen(false);
      }
    } catch (e) {
      Swal.fire("Error", e?.message || "Error registrando caja externa", "error");
    }
  };

  const handleTripModeChange = (mode) => {
    setTripMode(mode);
    if (mode === "individual") setForm("driver_id_second", "");
  };

  const handleTrailerTypeChange = (type) => {
    setTrailerType(type);
    if (type === "interna") setForm("caja_externa_id", "");
    else setForm("caja_id", "");
  };

  // ===== Submit principal (Alta) =====
  const validateRequiredFields = () => {
    for (let i = 0; i < etapas.length; i++) {
      const etapa = etapas[i];
      if (!etapa.company_id || !etapa.destination || !etapa.warehouse_destination_id) {
        Swal.fire("Incompletos", `Complete campos obligatorios etapa ${i + 1}`, "warning");
        return false;
      }
    }
    return true;
  };

  const buildEtapasJsonForAlta = () =>
    etapas.map((etapa) => ({
      ...etapa,
      loading_date: etapa.loading_date ? format(etapa.loading_date, "yyyy-MM-dd") : null,
      delivery_date: etapa.delivery_date ? format(etapa.delivery_date, "yyyy-MM-dd") : null,
      time_of_delivery: etapa.time_of_delivery || "",
      date_of_departure: etapa.date_of_departure ? format(etapa.date_of_departure, "yyyy-MM-dd") : null,
      estatus: "Up Coming",
      documentos: Object.entries(etapa.documentos || {}).reduce((acc, [k, v]) => {
        acc[k] = v ? { fileName: v.fileName || "", vencimiento: v.vencimiento || null } : null;
        return acc;
      }, {}),
      stops_in_transit: (etapa.stops_in_transit || []).map((s) => ({
        ...s,
        bl_firmado_doc: s.bl_firmado_doc
          ? { fileName: s.bl_firmado_doc.fileName || "" }
          : null,
      })),
    }));

  const appendFilesForAlta = (fd) => {
    etapas.forEach((etapa, idx) => {
      Object.entries(etapa.documentos || {}).forEach(([docType, docData]) => {
        if (docData?.file instanceof File) {
          fd.append(`etapa_${idx}_${docType}_file`, docData.file, docData.fileName);
        }
      });
      (etapa.stops_in_transit || []).forEach((stop, si) => {
        if (stop.bl_firmado_doc?.file instanceof File) {
          fd.append(
            `etapa_${idx}_stop_${si}_bl_firmado_file`,
            stop.bl_firmado_doc.file,
            stop.bl_firmado_doc.fileName,
          );
        }
      });
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (onSaveOverride) {
      onSaveOverride();
      return;
    }

    if (!validateRequiredFields()) return;

    Swal.fire({ title: "Guardando...", didOpen: () => Swal.showLoading() });
    setLoadingSave(true);

    const fd = new FormData();
    fd.append("op", "Alta");
    fd.append("trip_number", formData.trip_number);
    fd.append("driver_id", formData.driver_id || null);
    fd.append("driver_id_second", formData.driver_id_second || null);
    fd.append("truck_id", formData.truck_id || null);
    fd.append("caja_id", trailerType === "interna" ? formData.caja_id || null : null);
    fd.append("caja_externa_id", trailerType === "externa" ? formData.caja_externa_id || null : null);
    fd.append("country_code", countryCode);
    fd.append("trip_year", String(tripYear).slice(-2));
    fd.append("is_transnational", isTransnational ? 1 : 0);
    fd.append("transnational_number", isTransnational && isContinuation ? transnationalNumber : "");
    fd.append(
      "movement_number",
      isTransnational && isContinuation ? movementNumber : isTransnational ? 1 : "",
    );
    fd.append("origen_id", origenId || "");

    fd.append("etapas", JSON.stringify(buildEtapasJsonForAlta()));
    appendFilesForAlta(fd);

    try {
      const res = await fetch(`${apiHost}/new_tripsv2.php`, { method: "POST", body: fd });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        Swal.fire("¡Éxito!", "Viaje guardado", "success");
        onSuccess?.();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      Swal.fire("Error", err?.message || "Error guardando viaje", "error");
    } finally {
      setLoadingSave(false);
    }
  };

  const options = useMemo(
    () => ({
      activeDrivers,
      activeTrucks,
      activeTrailers,
      activeExternalTrailers,
    }),
    [activeDrivers, activeTrucks, activeTrailers, activeExternalTrailers],
  );

  const loaders = useMemo(
    () => ({
      drivers: loadingDrivers,
      trucks: loadingTrucks,
      trailers: loadingCajas,
      externalTrailers: loadingCajasExternas,
    }),
    [loadingDrivers, loadingTrucks, loadingCajas, loadingCajasExternas],
  );

  const errors = useMemo(
    () => ({
      drivers: errorDrivers,
      trucks: errorTrucks,
      trailers: errorCajas,
      externalTrailers: errorCajasExternas,
    }),
    [errorDrivers, errorTrucks, errorCajas, errorCajasExternas],
  );

  const loadingStates = useMemo(
    () => ({
      companies: loadingCompanies,
      creatingCompany: isCreatingCompany,
      warehouses: loadingWarehouses,
      creatingWarehouse: isCreatingWarehouse,
    }),
    [loadingCompanies, isCreatingCompany, loadingWarehouses, isCreatingWarehouse],
  );

  return {
    // Props útiles (debug / tracing)
    apiHost,

    // Estado dual + setters
    etapas,
    setEtapas,
    formData,
    setFormData,
    setForm,

    // Catálogos / options
    options,
    companyOptions,
    warehouseOptions,
    origenes,

    // Loaders / errors
    loaders,
    errors,
    loadingStates,
    loadingSave,

    // Flags de UI
    tripMode,
    trailerType,

    // Modales
    modalAbierto,
    setModalAbierto,
    modalTarget,
    setModalTarget,
    mostrarFechaVencimientoModal,
    setMostrarFechaVencimientoModal,
    isModalCajaExternaOpen,
    setIsModalCajaExternaOpen,

    // Handlers de flujo
    handleTripModeChange,
    handleTrailerTypeChange,
    addStage,
    removeStage,
    updateStage,
    handleEtapaChange,
    addStop,
    removeStop,
    updateStop,
    openDocModal,
    getCurrentDocValueForModal,
    handleGuardarDocumentoEtapa,
    handleCreateCompany,
    handleCreateWarehouse,
    handleSaveExternalCaja,
    handleSubmit,
  };
}

