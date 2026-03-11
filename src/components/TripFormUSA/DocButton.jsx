import { Paper, Box, Typography, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const DocButton = ({ label, doc, onClick }) => {
    return (
        <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: doc ? 'success.main' : 'divider' }}>
            <Box sx={{ overflow: 'hidden', mr: 1 }}>
                <Typography variant="caption" fontWeight={700} display="block" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="caption" noWrap display="block" color={doc ? 'text.primary' : 'text.disabled'}>
                    {doc ? (doc.fileName || doc.name) : 'Sin archivo'}
                </Typography>
            </Box>
            <IconButton size="small" color={doc ? "success" : "primary"} onClick={onClick}>
                <UploadFileIcon fontSize="small" />
            </IconButton>
        </Paper>
    );
};

export default DocButton;