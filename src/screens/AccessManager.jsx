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
    FormControl, InputLabel, Select, MenuItem, Stack,
    List, ListItem, ListItemText, Checkbox, Divider, IconButton,
} from '@mui/material';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon, Group as GroupIcon } from '@mui/icons-material';

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

    const [teamsModalOpen, setTeamsModalOpen] = useState(false);
    const [teamsList, setTeamsList] = useState([]);
    const [allUsersList, setAllUsersList] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [teamMembers, setTeamMembers] = useState([]); 
    const [newTeamForm, setNewTeamForm] = useState({ name: '', description: '' });

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

    const handleOpenTeamsManager = async () => {
        setTeamsModalOpen(true);
        loadTeamsAndUsers();
    };

    const loadTeamsAndUsers = async () => {
        try {
            const fd1 = new FormData(); fd1.append('op', 'get_teams');
            const res1 = await fetch(`${apiHost}/teams.php`, { method: 'POST', body: fd1 });
            const data1 = await res1.json();
            if(data1.status === 'success') setTeamsList(data1.data);

            const fd2 = new FormData(); fd2.append('op', 'get_users');
            const res2 = await fetch(`${apiHost}/teams.php`, { method: 'POST', body: fd2 });
            const data2 = await res2.json();
            if(data2.status === 'success') setAllUsersList(data2.data);
        } catch(e) { console.error(e); }
    };

    const handleCreateTeam = async () => {
        if(!newTeamForm.name) return Flashy.error("El nombre del equipo es obligatorio");
        try {
            const fd = new FormData();
            fd.append('op', 'create_team');
            fd.append('name', newTeamForm.name);
            fd.append('description', newTeamForm.description);
            const res = await fetch(`${apiHost}/teams.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if(data.status === 'success') {
                Flashy.success(data.message);
                setNewTeamForm({ name: '', description: '' });
                loadTeamsAndUsers();
            }
        } catch(e) { console.error(e); }
    };

    const handleSelectTeam = async (teamId) => {
        setSelectedTeamId(teamId);
        try {
            const fd = new FormData();
            fd.append('op', 'get_team_users');
            fd.append('team_id', teamId);
            const res = await fetch(`${apiHost}/teams.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if(data.status === 'success') setTeamMembers(data.data); // Array de IDs
        } catch(e) { console.error(e); }
    };

    const handleToggleMember = (userId) => {
        setTeamMembers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSaveTeamMembers = async () => {
        try {
            const fd = new FormData();
            fd.append('op', 'save_team_users');
            fd.append('team_id', selectedTeamId);
            fd.append('users', JSON.stringify(teamMembers));
            const res = await fetch(`${apiHost}/teams.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if(data.status === 'success') {
                setSnackbar({ open: true, message: 'Integrantes guardados', severity: 'success' });
            }
        } catch(e) { console.error(e); }
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

                <Box>
                    <Button variant="outlined" startIcon={<GroupIcon />} onClick={handleOpenTeamsManager} sx={{ mt: 1, mr: 2 }}>
                        Gestor de Equipos
                    </Button>
                    <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenNewUser} sx={{ mt: 1 }}>
                        Nuevo Usuario
                    </Button>
                </Box>
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

            {/* MODAL GESTOR DE EQUIPOS */}
            <Dialog open={teamsModalOpen} onClose={() => setTeamsModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Gestor de Equipos (Teams)</DialogTitle>
                <DialogContent dividers>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        
                        {/* Panel Izquierdo: Lista y Creación de Equipos */}
                        <Box sx={{ width: { xs: '100%', sm: '40%' } }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Crear Equipo</Typography>
                            <Stack spacing={1} mb={3}>
                                <TextField size="small" label="Nombre (Ej. Team A)" value={newTeamForm.name} onChange={e => setNewTeamForm({...newTeamForm, name: e.target.value})} />
                                <TextField size="small" label="Descripción (Opcional)" value={newTeamForm.description} onChange={e => setNewTeamForm({...newTeamForm, description: e.target.value})} />
                                <Button variant="contained" size="small" onClick={handleCreateTeam}>Agregar Equipo</Button>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Equipos Existentes</Typography>
                            <List dense sx={{ border: '1px solid #eee', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                                {teamsList.map(t => (
                                    <ListItem 
                                        button 
                                        key={t.team_id} 
                                        onClick={() => handleSelectTeam(t.team_id)}
                                        selected={selectedTeamId === t.team_id}
                                    >
                                        <ListItemText primary={t.name} secondary={t.description} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Panel Derecho: Asignación de Usuarios */}
                        <Box sx={{ width: { xs: '100%', sm: '60%' }, borderLeft: { sm: '1px solid #eee' }, pl: { sm: 3 } }}>
                            {!selectedTeamId ? (
                                <Typography color="text.secondary" mt={5} textAlign="center">Selecciona un equipo para asignar integrantes.</Typography>
                            ) : (
                                <>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="subtitle2" fontWeight="bold">Integrantes del Equipo</Typography>
                                        <Button variant="contained" color="success" size="small" onClick={handleSaveTeamMembers}>Guardar Cambios</Button>
                                    </Box>
                                    <List dense sx={{ border: '1px solid #eee', borderRadius: 1, maxHeight: 350, overflow: 'auto' }}>
                                        {allUsersList.map(u => {
                                            const isChecked = teamMembers.includes(u.id);
                                            return (
                                                <ListItem key={u.id} button onClick={() => handleToggleMember(u.id)}>
                                                    <Checkbox checked={isChecked} tabIndex={-1} disableRipple />
                                                    <ListItemText primary={u.name || u.user} secondary={u.type} />
                                                </ListItem>
                                            )
                                        })}
                                    </List>
                                </>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTeamsModalOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProfileAccessManager;