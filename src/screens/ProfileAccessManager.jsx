import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { menuItemsConfig } from '../config/menuConfig';
import UserTable from '../components/UserTable';
import PermissionModal from '../components/PermissionModal';
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
    const { user, userPermissions } = useContext(AuthContext);
    const apiHost = import.meta.env.VITE_API_HOST;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const sectionsToManage = getSectionsToManage();

    const fetchUsers = useCallback(async () => {
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
    }, [apiHost]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, userPermissions]);

    const handlePermissionChange = async (userId, sectionName, canView) => {
        let userUpdated = false;

        // Bloqueo temporal optimista
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                userUpdated = true;
                // Crear una nueva copia del objeto de permisos
                const newPermissions = { ...u.permissions, [sectionName]: canView };
                return { ...u, permissions: newPermissions };
            }
            return u;
        });

        setUsers(updatedUsers);

        if (userUpdated && selectedUser && selectedUser.id === userId) {
            // Encontrar el usuario actualizado dentro del nuevo arreglo `updatedUsers`
            const updatedUserInModal = updatedUsers.find(u => u.id === userId);
            if (updatedUserInModal) {
                // Actualizar el estado `selectedUser` para forzar la re-renderización del modal
                setSelectedUser(updatedUserInModal); 
            }
        }

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

    // Funciones para gestionar el modal
    const handleOpenModal = (userToEdit) => {
        setSelectedUser(userToEdit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
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
            
            {/* VISTA MAESTRA CON BÚSQUEDA Y PAGINACIÓN */}
            <UserTable 
                users={users} 
                onEditUser={handleOpenModal} 
            />

            {/* MODAL DE EDICIÓN DE PERMISOS */}
            <PermissionModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                user={selectedUser}
                sectionsToManage={sectionsToManage}
                handlePermissionChange={handlePermissionChange}
            />

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