import { 
    Modal, Box, Typography, Card, Paper, Grid, 
    Accordion, AccordionSummary, AccordionDetails, 
    Switch, FormControlLabel, Tooltip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
    borderRadius: 2,
};

const PermissionModal = ({ open, handleClose, user, sectionsToManage, handlePermissionChange }) => {
    // Si no hay usuario seleccionado, no renderizar el contenido del modal
    if (!user) return null; 

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-title" variant="h5" component="h2" sx={{ mb: 1 }}>
                    Permisos de: {user.name}
                </Typography>
                <Typography id="modal-description" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Email: {user.email} | Rol: {user.type}
                </Typography>

                {/* Contenedor principal de permisos con scroll */}
                <Card variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        {sectionsToManage.map(section => (
                            <Grid item xs={12} sm={6} md={4} key={section.name}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: (theme) => theme.palette.grey[50] }}>
                                    
                                    {/* Encabezado de la Sección */}
                                    <Accordion disableGutters elevation={0} sx={{ backgroundColor: 'transparent' }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls={`${section.name}-content`}
                                            id={`${section.name}-header`}
                                            sx={{ p: 0, '& .MuiAccordionSummary-content': { margin: '0 !important' } }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {section.name}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                                {/* Iteración de Subítems */}
                                                {section.subItems && section.subItems.length > 0 ? (
                                                    section.subItems.map(subItem => {
                                                        const permissionName = subItem.name;
                                                        const canView = user.permissions[permissionName] !== undefined ? user.permissions[permissionName] : false;

                                                        return (
                                                            <Tooltip key={permissionName} title={permissionName} placement="top">
                                                                <FormControlLabel
                                                                    control={
                                                                        <Switch
                                                                            checked={canView}
                                                                            onChange={(e) => handlePermissionChange(user.id, permissionName, e.target.checked)}
                                                                            size="small"
                                                                            color="secondary"
                                                                        />
                                                                    }
                                                                    label={`${permissionName.substring(0, 15)}${permissionName.length > 15 ? '...' : ''}`}
                                                                    sx={{ m: 0, justifyContent: 'space-between', width: '100%', mr: 0 }}
                                                                    labelPlacement="start"
                                                                />
                                                            </Tooltip>
                                                        );
                                                    })
                                                ) : (
                                                    // Permiso para sección sin subitems
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={user.permissions[section.name] !== undefined ? user.permissions[section.name] : false}
                                                                onChange={(e) => handlePermissionChange(user.id, section.name, e.target.checked)}
                                                                size="small"
                                                                color="primary"
                                                            />
                                                        }
                                                        label="Ver Sección"
                                                        sx={{ m: 0, justifyContent: 'space-between', width: '100%', mr: 0 }}
                                                        labelPlacement="start"
                                                    />
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Card>
            </Box>
        </Modal>
    );
};

export default PermissionModal;