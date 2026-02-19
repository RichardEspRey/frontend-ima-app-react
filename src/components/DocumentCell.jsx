import {
  Box, Stack, Chip, IconButton, Tooltip
} from "@mui/material";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const DocumentCell = ({ isUploaded, docName, onUpload, onView }) => {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            {isUploaded ? (
                <Chip icon={<CheckCircleIcon />} label="Subido" color="success" size="small" variant="filled" sx={{ fontWeight: 600, minWidth: 95 }} />
            ) : (
                <Chip icon={<ErrorOutlineIcon />} label="Falta" color="error" size="small" variant="outlined" sx={{ fontWeight: 600, minWidth: 95, bgcolor: 'rgba(211, 47, 47, 0.05)' }} />
            )}

            <Box>
                {isUploaded ? (
                    <Tooltip title={`Ver ${docName}`}>
                        <IconButton size="small" color="primary" onClick={onView} sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title={`Subir ${docName}`}>
                        <IconButton size="small" color="secondary" onClick={onUpload} sx={{ border: '1px dashed #9c27b0', bgcolor: '#fff' }}>
                            <CloudUploadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Stack>
    );
};