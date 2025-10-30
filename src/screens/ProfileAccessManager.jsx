import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { menuItemsConfig } from '../config/menuConfig';
import { 
    Container, Typography, Box, Paper, CircularProgress, 
    Alert, Switch, FormControlLabel,
    Snackbar, Card,
    Accordion, AccordionSummary, AccordionDetails, Grid, Tooltip
} from '@mui/material';
import { Settings as SettingsIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const getSectionsToManage = () => {
  return menuItemsConfig.filter(item => item.name !== 'Inicio');
};

const ADMIN_EMAILS_ACCESS = ['1', 'Israel_21027', 'Angelica_21020'];

const ProfileAccessManager = () => {
    const { user } = useContext(AuthContext);
    const apiHost = import.meta.env.VITE_API_HOST;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [expanded, setExpanded] = useState(null);

    const sectionsToManage = getSectionsToManage();

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('op', 'getProfilesAndPermissions');

            const response = await fetch(`${apiHost}/AccessManager.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                setUsers(data.users);
            } else {
                setError(data.message || 'Error al cargar usuarios.');
            }
        } catch (err) {
            console.error(err);
            setError('No se pudo conectar con el servidor.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handlePermissionChange = async (userId, sectionName, canView) => {
        // Bloqueo temporal optimista
        const updatedUsers = users.map(u => 
            u.id === userId 
            ? { ...u, permissions: { ...u.permissions, [sectionName]: canView } } 
            : u
        );
        setUsers(updatedUsers);

        try {
            const formData = new FormData();
            formData.append('op', 'updatePermission');
            formData.append('user_id', userId);
            formData.append('section_name', sectionName);
            formData.append('can_view', canView ? 'true' : 'false');

            const response = await fetch(`${apiHost}/AccessManager.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSnackbar({ open: true, message: `Permiso de ${sectionName} actualizado.`, severity: 'success' });
            } else {
                setSnackbar({ open: true, message: data.message || 'Error al guardar el permiso.', severity: 'error' });
                fetchUsers(); // Revertir cambio si falla
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Error de conexión al actualizar.', severity: 'error' });
            fetchUsers(); // Revertir cambio si falla
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleChangeAccordion = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Validación de acceso
    if (!user || user.tipo_usuario.toLowerCase() !== 'admin' || !ADMIN_EMAILS_ACCESS.includes(user.email)) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Acceso denegado. Solo administradores autorizados pueden ver esta sección.</Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Gestor de Perfiles y Accesos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra los accesos al menú y submenús para todos los usuarios.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <Box sx={{ maxWidth: '100%' }}>
                <Grid container spacing={3}>
                    {users.map((u) => (
                        <Grid item xs={12} key={u.id}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <Accordion 
                                    expanded={expanded === `user-${u.id}`} 
                                    onChange={handleChangeAccordion(`user-${u.id}`)}
                                    sx={{ '&.MuiAccordion-root': { border: 'none', boxShadow: 'none' } }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`panel-content-${u.id}`}
                                        id={`panel-header-${u.id}`}
                                        sx={{ 
                                            backgroundColor: (theme) => theme.palette.action.hover, 
                                            borderBottom: '1px solid',
                                            borderColor: (theme) => theme.palette.divider
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                            <Typography variant="h6">{u.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {u.email} (Rol: {u.type})
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Permisos de Menú</Typography>
                                        
                                        <Grid container spacing={2}>
                                            {sectionsToManage.map(section => (
                                                <Grid item xs={12} sm={6} md={4} key={section.name}>
                                                    <Paper elevation={1} sx={{ p: 2, backgroundColor: (theme) => theme.palette.grey[50] }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                                                            {section.name}
                                                        </Typography>
                                                        
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {section.subItems && section.subItems.length > 0 ? (
                                                                section.subItems.map(subItem => {

                                                                    const permissionName = subItem.name;

                                                                    const canView = u.permissions[permissionName] !== undefined ? u.permissions[permissionName] : false;

                                                                    return (
                                                                        <Tooltip key={permissionName} title={permissionName} placement="top">
                                                                            <FormControlLabel
                                                                                control={
                                                                                    <Switch
                                                                                        checked={canView}
                                                                                        onChange={(e) => 
                                                                                            handlePermissionChange(u.id, permissionName, e.target.checked)
                                                                                        }
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
                                                                            checked={u.permissions[section.name] !== undefined ? u.permissions[section.name] : false}
                                                                            onChange={(e) => 
                                                                                handlePermissionChange(u.id, section.name, e.target.checked)
                                                                            }
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
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfileAccessManager;