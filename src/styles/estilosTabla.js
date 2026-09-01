/**
 * @deprecated Puente temporal. Importa desde `shared/ui` en su lugar.
 *
 * Estos tokens se movieron a `src/shared/ui/estilos.js`: son interfaz compartida
 * y no lógica de negocio, así que su sitio es la capa `shared`. El puente existe
 * para no tocar los 11 archivos que ya los importaban; se borra cuando cada uno
 * pase por su incremento.
 */
export * from "../shared/ui/estilos"
