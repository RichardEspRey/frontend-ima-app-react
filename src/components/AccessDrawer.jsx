import React, { useState, useMemo, useEffect } from 'react';
import {
    Drawer, Box, Typography, IconButton,
    List, ListItem, ListItemText, Switch,
    Avatar, TextField, Chip, Stack,
    Tabs, Tab, CircularProgress,
    Button, FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    Computer as ComputerIcon,
    PhoneAndroid as PhoneAndroidIcon,
    ManageAccounts as ManageAccountsIcon,
    Save as SaveIcon
} from '@mui/icons-material';

const FeatureSection = ({ features, userId, onToggleFeature }) => {
    const grouped = useMemo(() => {
        if (!features || !features.length) return {};
        return features.reduce((acc, f) => {
            const mod = f.module || 'General';
            if (!acc[mod]) acc[mod] = [];
            acc[mod].push(f);
            return acc;
        }, {});
    }, [features]);

    if (!features || features.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                    No hay funcionalidades disponibles.
                </Typography>
            </Box>
        );
    }

    return (
        <List sx={{ width: '100%' }}>
            {Object.entries(grouped).map(([module, feats]) => (
                <React.Fragment key={module}>
                    <ListItem sx={{ bgcolor: 'action.hover', py: 0.5 }}>
                        <ListItemText
                            primary={module}
                            primaryTypographyProps={{ variant: 'overline', fontWeight: 'bold', color: 'text.secondary' }}
                        />
                    </ListItem>
                    {feats.map(f => (
                        <ListItem
                            key={f.feature_id}
                            divider
                            sx={{
                                borderLeft: f.enabled ? '4px solid #1976d2' : '4px solid transparent',
                                bgcolor: f.enabled ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ListItemText
                                primary={f.name}
                                secondary={f.description || f.feature_key}
                                primaryTypographyProps={{ fontWeight: 500 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <Switch
                                edge="end"
                                checked={Boolean(f.enabled)}
                                onChange={(e) => onToggleFeature(userId, f.feature_id, f.plataform, e.target.checked)}
                                color="primary"
                            />
                        </ListItem>
                    ))}
                </React.Fragment>
            ))}
        </List>
    );
};

const AccessDrawer = ({
    open, handleClose, user,
    featuresDesktop, featuresMobile, featuresLoading, onToggleFeature,
    onUpdateUser
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [form, setForm] = useState({ name: '', user: '', pass: '', type: '' });

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', user: user.user || '', pass: '', type: user.type || '' });
        }
    }, [user]);

    const handleFormChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const getInitials = (name) =>
        name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    if (!user) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 450 }, padding: 0, display: 'flex', flexDirection: 'column' }
            }}
        >
            {/* CABECERA */}
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white', flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}>
                            {getInitials(user.name)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" lineHeight={1.2}>
                                {user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {user.user}
                            </Typography>
                            <Box mt={0.5}>
                                <Chip
                                    label={user.type}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
                                />
                            </Box>
                        </Box>
                    </Stack>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </Box>

            {/* TABS */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                    <Tab icon={<ManageAccountsIcon fontSize="small" />} label="Datos" iconPosition="start" sx={{ minHeight: 48 }} />
                    <Tab icon={<ComputerIcon fontSize="small" />} label="Desktop" iconPosition="start" sx={{ minHeight: 48 }} />
                    <Tab icon={<PhoneAndroidIcon fontSize="small" />} label="Mobile" iconPosition="start" sx={{ minHeight: 48 }} />
                </Tabs>
            </Box>

            {/* CONTENIDO */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>

                {/* Tab 0: Datos del usuario */}
                {activeTab === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                            Información del usuario
                        </Typography>
                        <Divider sx={{ mb: 3, mt: 0.5 }} />

                        <Stack spacing={2.5}>
                            <TextField
                                label="Nombre"
                                value={form.name}
                                onChange={handleFormChange('name')}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Usuario"
                                value={form.user}
                                onChange={handleFormChange('user')}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Contraseña"
                                type="password"
                                value={form.pass}
                                onChange={handleFormChange('pass')}
                                fullWidth
                                size="small"
                                placeholder="Dejar vacío para no cambiar"
                                helperText="Solo completa si deseas cambiar la contraseña"
                            />
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={form.type}
                                    label="Tipo"
                                    onChange={handleFormChange('type')}
                                >
                                    <MenuItem value="Administrativo">Administrativo</MenuItem>
                                    <MenuItem value="Driver">Driver</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={() => onUpdateUser(user.id, form)}
                                fullWidth
                            >
                                Guardar
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* Tab 1: Funcionalidades Desktop */}
                {activeTab === 1 && (
                    featuresLoading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                        : <FeatureSection
                            features={featuresDesktop}
                            userId={user.id}
                            onToggleFeature={onToggleFeature}
                        />
                )}

                {/* Tab 2: Funcionalidades Mobile */}
                {activeTab === 2 && (
                    featuresLoading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                        : <FeatureSection
                            features={featuresMobile}
                            userId={user.id}
                            onToggleFeature={onToggleFeature}
                        />
                )}
            </Box>
        </Drawer>
    );
};

export default AccessDrawer;
