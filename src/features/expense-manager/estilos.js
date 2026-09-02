import { COLOR } from "../../shared/ui/tokens"
export {
  SECTION_LABEL_SX,
  CARD_SX,
  HEADER_ROW_SX,
  HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
  DARK_BTN_SX,
  GHOST_BTN_SX,
  INPUT_SX,
} from '../../shared/ui/estilos';


export const DATEPICKER_CSS = `
  .expense-datepicker {
    padding: 8.5px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    width: 100%;
    font-size: 0.9rem;
    color: #334155;
    box-sizing: border-box;
    height: 40px;
    background: #fff;
    transition: border-color .15s, box-shadow .15s;
  }
  .expense-datepicker:focus {
    border-color: #0f172a;
    box-shadow: 0 0 0 1px #0f172a;
    outline: none;
  }
  .expense-datepicker-wrapper { width: 100%; display: block; }
  .expense-datepicker-popper { z-index: 20; }
`;

/**
 * Un importe en dólares.
 *
 * @param {*} v La cantidad.
 * @returns {string} El importe formateado.
 */
export const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v || 0));

/**
 * Un importe en pesos.
 *
 * Va en `es-MX` a propósito, no en `en-US` como el de dólares: es la cifra que
 * se compara contra facturas mexicanas.
 *
 * @param {*} v La cantidad.
 * @returns {string} El importe formateado.
 */
export const moneyMXN = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(v || 0));
