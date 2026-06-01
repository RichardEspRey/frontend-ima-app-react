import { useState, useEffect, useCallback } from 'react';
import Flashy from '@pablotheblink/flashyjs';
import { useAuthStore } from '../store/useAuthStore';
import { menuItemsConfig } from '../config/menuConfig';
import TableUser from '../components/TableUser';
import AccessDrawer from '../components/AccessDrawer';
import {
    Container, Typography, Box, CircularProgress,
    Alert, Snackbar, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Stack
} from '@mui/material';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

const getSectionsToManage = () => menuItemsConfig;
const ADMIN_TYPES = new Set(["admin"]);

const ProfileAccessManager = () => {
    const { user, fetchPermissions } = useAuthStore();
    const apiHost = import.meta.env.VITE_API_HOST;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [featuresDesktop, setFeaturesDesktop] = useState([]);
    const [featuresMobile, setFeaturesMobile] = useState([]);
    const [featuresLoading, setFeaturesLoading] = useState(false);

    const [newUserModal, setNewUserModal] = useState({ open: false, name: '', user: '', pass: '', type: '' });
    const sectionsToManage = getSectionsToManage();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('op', 'get_users');
            const response = await fetch(`${apiHost}/features.php`, { method: 'POST', body: formData });
            const data = await response.json();
            if (data.status === 'success') setUsers(data.users);
            else setError(data.message || 'Error al cargar usuarios.');
        } catch (err) { setError('No se pudo conectar con el servidor.'); }
        setLoading(false);
    }, [apiHost]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleOpenDrawer = async (userToEdit) => {
        setSelectedUser(userToEdit);
        setIsDrawerOpen(true);
        setFeaturesDesktop([]);
        setFeaturesMobile([]);
        setFeaturesLoading(true);

        try {
            const formData = new FormData();
            formData.append('op', 'get_all_user_features');
            formData.append('user_id', userToEdit.id);
            const res = await fetch(`${apiHost}/features.php`, { method: 'POST', body: formData });
            const data = await res.json();
            const allFeatures = data.status === 'success' ? data.features : [];

            setFeaturesDesktop(allFeatures.filter(f => f.plataform === 'Desktop'));
            setFeaturesMobile(allFeatures.filter(f => f.plataform === 'Mobile'));
        } catch (err) { console.error(err); }
        setFeaturesLoading(false);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedUser(null);
        setFeaturesDesktop([]);
        setFeaturesMobile([]);
    };

    const handleToggleFeature = async (userId, featureId, plataform, enabled) => {
        const updater = (features) => features.map(f => f.feature_id === featureId ? { ...f, enabled: enabled ? 1 : 0 } : f);
        if (plataform === 'Desktop') setFeaturesDesktop(prev => updater(prev));
        else setFeaturesMobile(prev => updater(prev));

        try {
            const formData = new FormData();
            formData.append('op', 'toggle_user_feature');
            formData.append('user_id', userId);
            formData.append('feature_id', featureId);
            formData.append('enabled', enabled ? '1' : '0'); // 🚨 Estricto

            const res = await fetch(`${apiHost}/features.php`, { method: 'POST', body: formData });
            const data = await res.json();

            if (data.status === 'success') {
                Flashy.success(enabled ? 'Permiso otorgado.' : 'Permiso revocado.');
                if (String(userId) === String(user?.id)) await fetchPermissions(userId);
            } else {
                const reverter = (features) => features.map(f => f.feature_id === featureId ? { ...f, enabled: enabled ? 0 : 1 } : f);
                if (plataform === 'Desktop') setFeaturesDesktop(prev => reverter(prev));
                else setFeaturesMobile(prev => reverter(prev));
                setSnackbar({ open: true, message: data.message || 'Error al actualizar.', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error de conexión.', severity: 'error' });
        }
    };

    const handleOpenNewUser = () => setNewUserModal({ open: true, name: '', user: '', pass: '', type: '' });
    const handleCloseNewUser = () => setNewUserModal({ open: false, name: '', user: '', pass: '', type: '' });
    const handleNewUserChange = (field) => (e) => setNewUserModal(prev => ({ ...prev, [field]: e.target.value }));

    const handleCreateUser = async () => {
        const { name, user: username, pass, type } = newUserModal;
        if (!name || !username || !pass || !type) return Flashy.error('Todos los campos son requeridos para crear el usuario.');
        try {
            const formData = new FormData();
            formData.append('op', 'create_user'); formData.append('name', name);
            formData.append('user', username); formData.append('pass', pass); formData.append('type', type);
            const res = await fetch(`${apiHost}/features.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                setSnackbar({ open: true, message: 'Usuario creado exitosamente.', severity: 'success' });
                handleCloseNewUser(); fetchUsers();
            } else setSnackbar({ open: true, message: data.message || 'Error al crear.', severity: 'error' });
        } catch (err) { setSnackbar({ open: true, message: 'Error de conexión.', severity: 'error' }); }
    };

    const handleUpdateUser = async (userId, data) => {
        try {
            const formData = new FormData();
            formData.append('op', 'update_user'); formData.append('user_id', userId);
            formData.append('name', data.name); formData.append('user', data.user);
            formData.append('type', data.type); formData.append('active', data.active);
            if (data.pass) formData.append('pass', data.pass);
            const res = await fetch(`${apiHost}/features.php`, { method: 'POST', body: formData });
            const response = await res.json();
            if (response.status === 'success') {
                Flashy.success('Usuario actualizado.');
                fetchUsers(); handleCloseDrawer();
            } else setSnackbar({ open: true, message: response.message || 'Error al actualizar.', severity: 'error' });
        } catch (err) { setSnackbar({ open: true, message: 'Error de conexión.', severity: 'error' }); }
    };

    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));
    const userType = String(user?.tipo_usuario || '').trim().toLowerCase();

    if (!user || !ADMIN_TYPES.has(userType)) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Acceso denegado. Solo administradores pueden ver esta sección.</Alert>
            </Container>
        );
    }

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="80vh"><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                        Gestor de Perfiles y Accesos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sincronización en tiempo real para todos los usuarios.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenNewUser} sx={{ mt: 1 }}>
                    Nuevo Usuario
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <TableUser users={users} onEditUser={handleOpenDrawer} />

            <AccessDrawer
                open={isDrawerOpen}
                handleClose={handleCloseDrawer}
                user={selectedUser}
                featuresDesktop={featuresDesktop}
                featuresMobile={featuresMobile}
                featuresLoading={featuresLoading}
                onToggleFeature={handleToggleFeature}
                onUpdateUser={handleUpdateUser}
                sectionsToManage={sectionsToManage} 
            />

            <Dialog open={newUserModal.open} onClose={handleCloseNewUser} maxWidth="sm" fullWidth>
                <DialogTitle>Nuevo Usuario</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Nombre" value={newUserModal.name} onChange={handleNewUserChange('name')} fullWidth size="small" autoFocus />
                        <TextField label="Usuario" value={newUserModal.user} onChange={handleNewUserChange('user')} fullWidth size="small" />
                        <TextField label="Contraseña" type="password" value={newUserModal.pass} onChange={handleNewUserChange('pass')} fullWidth size="small" />
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo</InputLabel>
                            <Select value={newUserModal.type} label="Tipo" onChange={handleNewUserChange('type')}>
                                <MenuItem value="Administrativo">Administrativo</MenuItem>
                                <MenuItem value="Driver">Driver</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewUser}>Cancelar</Button>
                    <Button variant="contained" onClick={handleCreateUser}>Guardar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfileAccessManager;