import {
  Box, Stack, Chip, IconButton, Tooltip
} from "@mui/material";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { CHIP_OK_SX, CHIP_DANGER_SX, ICON_BTN_SX } from '../shared/ui/estilos';
import { COLOR } from '../shared/ui/tokens';

export const DocumentCell = ({ isUploaded, docName, onUpload, onView }) => {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            {isUploaded ? (
                <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    label="Subido"
                    size="small"
                    sx={{ ...CHIP_OK_SX, minWidth: 92, '& .MuiChip-icon': { color: COLOR.EXITO, ml: 0.75 } }}
                />
            ) : (
                <Chip
                    icon={<ErrorOutlineIcon sx={{ fontSize: 14 }} />}
                    label="Falta"
                    size="small"
                    sx={{ ...CHIP_DANGER_SX, minWidth: 92, '& .MuiChip-icon': { color: COLOR.PELIGRO, ml: 0.75 } }}
                />
            )}

            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {isUploaded && (
                    <Tooltip title={`Ver ${docName}`}>
                        <IconButton size="small" onClick={onView} sx={ICON_BTN_SX}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title={`Subir ${docName}`}>
                    <IconButton size="small" onClick={onUpload} sx={ICON_BTN_SX}>
                        <CloudUploadIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Stack>
    );
};
