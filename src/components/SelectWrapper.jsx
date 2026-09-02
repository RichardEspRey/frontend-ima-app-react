import React from 'react';
import { Box, InputLabel } from '@mui/material';
import { SelectorBusqueda } from '../shared/ui';

/**
 * Selector con etiqueta, para los formularios de viaje.
 *
 * Antes envolvía `react-select`; ahora envuelve `SelectorBusqueda`, que es el
 * selector del sistema. **Su interfaz no cambió**, y por eso los seis archivos
 * que lo usan no se tocaron: sigue recibiendo y entregando la opción completa
 * `{value, label}`, que es de lo que dependen los formularios al armar el envío.
 *
 * Esa es la ventaja de que existiera este envoltorio: cambiar de librería fue
 * editar un archivo. Donde `react-select` se usaba directo hubo que tocar cada
 * pantalla.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.label Texto sobre el campo.
 * @param {boolean} [props.isCreatable] Si permite crear una opción nueva.
 * @param {object} [props.value] La opción elegida.
 * @param {Function} props.onChange `(opcion|null) => void`.
 * @param {Function} [props.onCreateOption] `(texto) => void` al crear una opción.
 * @param {Array} props.options Las opciones disponibles.
 * @param {boolean} [props.isLoading] Si las opciones están llegando.
 * @param {boolean} [props.isDisabled] Si el campo está bloqueado.
 * @param {string} [props.placeholder] Texto cuando está vacío.
 * @param {Function} [props.formatCreateLabel] Texto de la entrada de crear.
 * @returns {object} El campo renderizado.
 */
const SelectWrapper = ({
    label,
    isCreatable,
    value,
    onChange,
    onCreateOption,
    options,
    isLoading,
    isDisabled,
    placeholder,
    formatCreateLabel,
}) => (
    <Box sx={{ mb: 2 }}>
        <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem', color: 'text.primary' }}>
            {label}
        </InputLabel>
        <SelectorBusqueda
            value={value}
            onChange={onChange}
            options={options}
            isLoading={isLoading}
            isDisabled={isDisabled}
            placeholder={placeholder}
            permitirCrear={isCreatable}
            onCrear={onCreateOption}
            etiquetaCrear={formatCreateLabel}
        />
    </Box>
);

export default SelectWrapper;
