export const PAYMENT_METHODS = ["RTS", "CHEQUE", "TRIUM PAY", "DEPOSITO"];

export const STATUS_OPTIONS = [
  { value: 3, label: "Pagada", color: "#2e7d32" },
  { value: 2, label: "Cobrada, pendiente RTS", color: "#fdd835" },
  { value: 1, label: "Cobrada, pendiente de pago", color: "#fb8c00" },
  { value: 0, label: "Pendiente de cobrar", color: "#d32f2f" },
  { value: null, label: "Pendiente de cobrar", color: "#d32f2f" },
];
