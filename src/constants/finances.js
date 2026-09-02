import { COLOR } from "../shared/ui/tokens"
export const PAYMENT_METHODS = ["RTS", "CHEQUE", "TRIUM PAY", "DEPOSITO"];

export const STATUS_OPTIONS = [
  { value: 3, label: "Pagada", color: COLOR.EXITO },
  { value: 2, label: "Cobrada, pendiente RTS", color: "#fdd835" },
  { value: 1, label: "Cobrada, pendiente de pago", color: COLOR.AVISO },
  { value: 0, label: "Pendiente de cobrar", color: COLOR.PELIGRO },
  { value: null, label: "Pendiente de cobrar", color: COLOR.PELIGRO },
];
