import { STATUS_OPTIONS } from "../constants/finances";

export const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  }).format(Number(v || 0));

export const getTripStatusSummary = (stages) => {
  if (!stages || stages.length === 0) {
    return { value: 3, label: "Completado", color: STATUS_OPTIONS[3].color };
  }
  const normalizedStages = stages.map((s) => ({
    ...s,
    status: s.status != null ? Number(s.status) : 0,
  }));

  if (normalizedStages.some((s) => s.status === 0 || s.status === 1)) {
    const redStatus = STATUS_OPTIONS.find((o) => o.value === 0);
    return { value: 0, label: redStatus.label, color: redStatus.color };
  }
  if (normalizedStages.some((s) => s.status === 2)) {
    const yellowStatus = STATUS_OPTIONS.find((o) => o.value === 2);
    return { value: 2, label: yellowStatus.label, color: yellowStatus.color };
  }
  const completedStatus = STATUS_OPTIONS.find((o) => o.value === 3);
  return {
    value: 3,
    label: completedStatus.label,
    color: completedStatus.color,
  };
};

export const countCriticalStages = (stages) => {
  if (!stages || stages.length === 0) return { 0: 0, 1: 0, 2: 0 };
  return stages.reduce(
    (acc, s) => {
      const status = Number(s.status);
      if ([0, 1, 2].includes(status)) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    },
    { 0: 0, 1: 0, 2: 0 }
  );
};

// Validaciones para el guardado
export const validateStage = (stage) => {
  const errs = [];
  const metodo = (stage.payment_method ?? "").trim();
  const tarifaStr = String(stage.paid_rate ?? "").trim();
  const tarifaNum = Number(tarifaStr.replace(",", "."));

  if (!metodo) errs.push("Método de pago vacío");
  if (tarifaStr === "" || Number.isNaN(tarifaNum))
    errs.push("Tarifa pagada inválida");
  else if (tarifaNum <= 0) errs.push("Tarifa pagada debe ser > 0");
  if (
    stage.status === "" ||
    stage.status === null ||
    Number.isNaN(Number(stage.status))
  )
    errs.push("Status inválido");

  return errs;
};

export const buildPayloadItem = (stage) => {
  const tarifaStr = String(stage.paid_rate ?? "").trim();
  const tarifaNum = Number(tarifaStr.replace(",", "."));
  return {
    id: String(stage.trip_stage_id),
    metodo: (stage.payment_method ?? "").trim(),
    tarifa: Number.isFinite(tarifaNum) ? tarifaNum.toFixed(2) : "0.00",
    status: String(Number(stage.status)),
  };
};

export const collectDirtyStages = (trips) => {
  const dirty = [];
  for (const t of trips) {
    for (const s of t.stages) {
      if (s._dirty) dirty.push({ tripId: t.trip_id, stage: s });
    }
  }
  return dirty;
};
