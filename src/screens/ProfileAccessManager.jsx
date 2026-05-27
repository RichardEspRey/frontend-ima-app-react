import React, { useState, useEffect, useCallback } from 'react';
import { menuItemsConfig } from '../config/menuConfig';
import UserTable from '../components/UserTable';
import PermissionDrawer from '../components/PermissionDrawer'; 
import { 
    Box, Typography, CircularProgress, 
    Alert, Snackbar, Stack, Chip
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

import { useAuthStore } from '../store/useAuthStore';

const getSectionsToManage = () => {
  return menuItemsConfig;
};

const ADMIN_EMAILS_ACCESS = ['1', 'israel_21027', 'angelica_21020'];

const ProfileAccessManager = () => {
    const { user, fetchPermissions } = useAuthStore();
    const apiHost = import.meta.env.VITE_API_HOST;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
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
    }, [fetchUsers]);

    const handlePermissionChange = async (userId, sectionName, canView) => {
        let userUpdated = false;

        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                userUpdated = true;
                const newPermissions = { ...u.permissions, [sectionName]: canView };
                return { ...u, permissions: newPermissions };
            }
            return u;
        });

        setUsers(updatedUsers);

        if (userUpdated && selectedUser && selectedUser.id === userId) {
            const updatedUserInModal = updatedUsers.find(u => u.id === userId);
            if (updatedUserInModal) {
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
                setSnackbar({ open: true, message: `Permiso actualizado correctamente.`, severity: 'success' });
                
                if (String(userId) === String(user?.id)) {
                    await fetchPermissions(userId);
                }
                
            } else {
                setSnackbar({ open: true, message: data.message || 'Error al guardar el permiso.', severity: 'error' });
                fetchUsers(); 
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Error de conexión al actualizar.', severity: 'error' });
            fetchUsers(); 
        }
    };

    const handleOpenDrawer = (userToEdit) => {
        setSelectedUser(userToEdit);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedUser(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const userEmail = String(user?.email || '').trim().toLowerCase();
    const userType = String(user?.tipo_usuario || '').trim().toLowerCase();
    
    if (!user || userType !== 'admin' || !ADMIN_EMAILS_ACCESS.includes(userEmail)) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Alert severity="error" sx={{ borderRadius: 2, fontWeight: 600 }}>
                    Acceso denegado. Solo administradores autorizados (Nivel Root) pueden ver esta sección.
                </Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress sx={{ color: '#0f172a' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SecurityIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
                        Gestor de Accesos
                    </Typography>
                    <Typography variant="subtitle1" color="#64748b" sx={{ mt: 0.5 }}>
                        Administración de políticas por usuario.
                    </Typography>
                </Box>
                <Chip label="Nivel de Seguridad: ROOT" color="error" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }} />
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            
            <UserTable 
                users={users} 
                onEditUser={handleOpenDrawer}
            />

            <PermissionDrawer
                open={isDrawerOpen}
                handleClose={handleCloseDrawer}
                user={selectedUser}
                sectionsToManage={sectionsToManage}
                handlePermissionChange={handlePermissionChange}
            />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }} elevation={6} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProfileAccessManager;