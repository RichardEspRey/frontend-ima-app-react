import { useState, useEffect, useCallback } from 'react';
import Flashy from '@pablotheblink/flashyjs';
import { useAuthStore } from '../store/useAuthStore';
import {
    Container, Typography, Box, Alert, Snackbar, Button,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Stack, Autocomplete, Paper, ToggleButtonGroup, ToggleButton,
    CircularProgress,
} from '@mui/material';
import { NotificationsActive as NotificationsIcon, Send as SendIcon } from '@mui/icons-material';

const ADMIN_TYPES = new Set(["admin"]);
const AUDIENCE = { USER: 'user', TEAM: 'team', ALL: 'all' };

const NotificationsAdmin = () => {
    const { user } = useAuthStore();
    const apiHost = import.meta.env.VITE_API_HOST;

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [audience, setAudience] = useState(AUDIENCE.USER);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const loadAudienceData = useCallback(async () => {
        setLoading(true);
        try {
            const fd1 = new FormData(); fd1.append('op', 'get_users');
            const res1 = await fetch(`${apiHost}/teams.php`, { method: 'POST', body: fd1 });
            const data1 = await res1.json();
            if (data1.status === 'success') setUsers(data1.data);

            const fd2 = new FormData(); fd2.append('op', 'get_teams');
            const res2 = await fetch(`${apiHost}/teams.php`, { method: 'POST', body: fd2 });
            const data2 = await res2.json();
            if (data2.status === 'success') setTeams(data2.data);
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'No se pudo cargar usuarios/equipos.', severity: 'error' });
        }
        setLoading(false);
    }, [apiHost]);

    useEffect(() => { loadAudienceData(); }, [loadAudienceData]);

    const resetForm = () => {
        setTitle('');
        setBody('');
        setSelectedUser(null);
        setSelectedTeamId('');
    };

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) {
            return Flashy.error('El título y el mensaje son obligatorios.');
        }
        if (audience === AUDIENCE.USER && !selectedUser) {
            return Flashy.error('Selecciona un usuario destino.');
        }
        if (audience === AUDIENCE.TEAM && !selectedTeamId) {
            return Flashy.error('Selecciona un equipo destino.');
        }

        const opByAudience = {
            [AUDIENCE.USER]: 'send_to_user',
            [AUDIENCE.TEAM]: 'send_to_team',
            [AUDIENCE.ALL]: 'send_to_all',
        };

        setSending(true);
        try {
            const fd = new FormData();
            fd.append('op', opByAudience[audience]);
            fd.append('title', title.trim());
            fd.append('body', body.trim());
            if (audience === AUDIENCE.USER) fd.append('user_id', selectedUser.id);
            if (audience === AUDIENCE.TEAM) fd.append('team_id', selectedTeamId);

            const res = await fetch(`${apiHost}/notifications.php`, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.status === 'success') {
                setSnackbar({ open: true, message: data.message || 'Notificación enviada.', severity: 'success' });
                resetForm();
            } else {
                setSnackbar({ open: true, message: data.message || 'Error al enviar la notificación.', severity: 'error' });
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Error de conexión con el servidor.', severity: 'error' });
        }
        setSending(false);
    };

    const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));
    const userType = String(user?.tipo_usuario || '').trim().toLowerCase();

    if (!user || !ADMIN_TYPES.has(userType)) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Acceso denegado. Solo administradores pueden ver esta sección.</Alert>
            </Container>
        );
    }

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="80vh"><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                Enviar Notificaciones
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Envía notificaciones push a un usuario específico, a un equipo, o a todos los usuarios.
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <ToggleButtonGroup
                        value={audience}
                        exclusive
                        onChange={(_, value) => value && setAudience(value)}
                        color="primary"
                        fullWidth
                    >
                        <ToggleButton value={AUDIENCE.USER}>Usuario específico</ToggleButton>
                        <ToggleButton value={AUDIENCE.TEAM}>Equipo</ToggleButton>
                        <ToggleButton value={AUDIENCE.ALL}>Todos</ToggleButton>
                    </ToggleButtonGroup>

                    {audience === AUDIENCE.USER && (
                        <Autocomplete
                            options={users}
                            getOptionLabel={(u) => u.name || u.user || ''}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            value={selectedUser}
                            onChange={(_, value) => setSelectedUser(value)}
                            renderInput={(params) => <TextField {...params} label="Usuario destino" size="small" />}
                        />
                    )}

                    {audience === AUDIENCE.TEAM && (
                        <FormControl fullWidth size="small">
                            <InputLabel>Equipo destino</InputLabel>
                            <Select
                                value={selectedTeamId}
                                label="Equipo destino"
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                            >
                                {teams.map((t) => (
                                    <MenuItem key={t.team_id} value={t.team_id}>{t.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        label="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Mensaje"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        size="small"
                    />

                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={handleSend}
                            disabled={sending}
                        >
                            {sending ? 'Enviando...' : 'Enviar Notificación'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default NotificationsAdmin;
