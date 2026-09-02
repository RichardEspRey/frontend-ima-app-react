import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Box, InputLabel } from '@mui/material';

const customSelectStyles = {
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
    }),
};

const ExpenseSelect = ({ label, isCreatable = false, ...props }) => {
    const Component = isCreatable ? CreatableSelect : Select;
    return (
        <Box sx={{ mb: 2 }}>
            <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem', color: 'text.primary' }}>{label}</InputLabel>
            <Component
                styles={customSelectStyles}
                {...props}
            />
        </Box>
    );
};

export default ExpenseSelect;