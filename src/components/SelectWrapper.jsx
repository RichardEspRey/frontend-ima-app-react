import React from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { InputLabel, Box, Typography } from '@mui/material';

const selectStyles = {
    control: (provided) => ({
        ...provided,
        padding: '4px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '16px',
        minHeight: '40px',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        backgroundColor: 'white',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#3C48E1' : state.isFocused ? '#f0f0f0' : null,
        color: state.isSelected ? 'white' : '#333',
    }),
};

const SelectWrapper = ({ label, isCreatable, value, onChange, onCreateOption, options, isLoading, isDisabled, placeholder, formatCreateLabel = (v) => `Crear: "${v}"` }) => {
    const Component = isCreatable ? CreatableSelect : Select;

    return (
        <Box sx={{ mb: 2 }}>
            <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem', color: 'text.primary' }}>{label}</InputLabel>
            <Component
                value={value}
                onChange={onChange}
                options={options}
                isLoading={isLoading}
                isDisabled={isDisabled}
                placeholder={placeholder}
                styles={selectStyles}
                isClearable
                {...(isCreatable && { onCreateOption: onCreateOption, formatCreateLabel: formatCreateLabel })}
            />
        </Box>
    );
};

export default SelectWrapper;