import React, { useState, useMemo, useEffect } from 'react';
import {
    Drawer, Box, Typography, IconButton,
    List, ListItem, ListItemText, ListItemIcon, Switch,
    Avatar, TextField, Chip, Stack,
    Tabs, Tab, CircularProgress, Collapse,
    Button, FormControl, InputLabel, Select, MenuItem, Divider,
    InputAdornment
} from '@mui/material';
import {
    Close as CloseIcon,
    Computer as ComputerIcon,
    PhoneAndroid as PhoneAndroidIcon,
    ManageAccounts as ManageAccountsIcon,
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Security as SecurityIcon,
    SubdirectoryArrowRight as SubIcon,
    ExpandLess, ExpandMore,
    Search as SearchIcon
} from '@mui/icons-material';

const PermissionNode = ({ node, level, desktopFeaturesMap, onToggleFeature, userId, expandedSections, toggleSection, searchTerm, isParentAllowed = true }) => {
    const hasSubItems = node.subItems && node.subItems.length > 0;
    const permissionKey = node.featureKey || node.name;
    
    const featureData = desktopFeaturesMap[permissionKey];
    const existInDB = !!featureData;
    const isAllowed = existInDB && Number(featureData.enabled) === 1;
    
    const isExpanded = expandedSections[permissionKey] || searchTerm.length > 0;
    
    const effectiveAllowed = isParentAllowed && isAllowed;
    const isRoot = level === 0;

    return (
        <React.Fragment>
            <ListItem
                divider={isRoot}
                onClick={hasSubItems ? () => toggleSection(permissionKey) : undefined}
                sx={{
                    pl: 2 + (level * 4), 
                    py: 1,
                    cursor: hasSubItems ? 'pointer' : 'default',
                    bgcolor: isAllowed ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                    borderLeft: isAllowed ? '4px solid #1976d2' : '4px solid transparent',
                    opacity: existInDB && isParentAllowed ? 1 : 0.6,
                    transition: 'all 0.2s'
                }}
            >
                <ListItemIcon sx={{ minWidth: 40 }}>
                    {isRoot ? (
                        <SecurityIcon color={isAllowed && isParentAllowed ? "primary" : "disabled"} />
                    ) : (
                        <SubIcon fontSize="small" color={isAllowed && isParentAllowed ? "action" : "disabled"} />
                    )}
                </ListItemIcon>

                <ListItemText
                    primary={node.name}
                    secondary={!existInDB ? "⚠ Falta dar de alta en BD" : (isRoot && hasSubItems ? "Desplegar opciones" : (!node.route ? "Control de Pestaña/Vista" : "Acceso a pantalla"))}
                    primaryTypographyProps={{ fontWeight: isRoot ? 500 : 400, variant: isRoot ? 'body1' : 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption', color: !existInDB ? 'error.main' : 'textSecondary' }}
                />

                <Switch
                    size={isRoot ? "medium" : "small"} 
                    edge="end" 
                    checked={isAllowed}
                    disabled={!existInDB || !isParentAllowed}
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => existInDB && onToggleFeature(userId, featureData.feature_id, 'Desktop', e.target.checked)}
                    color="primary"
                />

                {hasSubItems && (
                    <IconButton size="small" sx={{ ml: 1 }}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                )}
            </ListItem>

            {hasSubItems && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ bgcolor: isRoot ? '#fafafa' : 'transparent' }}>
                        {node.subItems.map(child => (
                            <PermissionNode
                                key={child.featureKey || child.name} 
                                node={child} 
                                level={level + 1}
                                desktopFeaturesMap={desktopFeaturesMap} 
                                onToggleFeature={onToggleFeature} 
                                userId={userId}
                                expandedSections={expandedSections} 
                                toggleSection={toggleSection} 
                                searchTerm={searchTerm}
                                isParentAllowed={effectiveAllowed} 
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </React.Fragment>
    );
};

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
                                borderLeft: Number(f.enabled) === 1 ? '4px solid #1976d2' : '4px solid transparent',
                                bgcolor: Number(f.enabled) === 1 ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
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
                                checked={Number(f.enabled) === 1}
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
    open, handleClose, user, sectionsToManage,
    featuresDesktop, featuresMobile, featuresLoading, onToggleFeature,
    onUpdateUser
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [form, setForm] = useState({ name: '', user: '', pass: '', type: '', active: '1' });
    const [showPass, setShowPass] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', user: user.user || '', pass: user.pass || '', type: user.type || '', active: user.active ?? '1' });
        }
    }, [user]);

    const handleFormChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
    const toggleSection = (sectionKey) => setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const desktopFeaturesMap = useMemo(() => {
        const map = {};
        featuresDesktop.forEach(f => { map[f.feature_key] = f; });
        return map;
    }, [featuresDesktop]);

    const filteredDesktopSections = useMemo(() => {
        if (!sectionsToManage) return [];
        if (!searchTerm) return sectionsToManage;
        const lower = searchTerm.toLowerCase();
        
        const searchNode = (node) => {
            const match = node.name.toLowerCase().includes(lower);
            if (node.subItems) {
                const subMatches = node.subItems.filter(searchNode);
                if (match || subMatches.length > 0) return { ...node, subItems: subMatches.length > 0 ? subMatches : node.subItems };
            }
            return match ? node : null;
        };
        return sectionsToManage.map(searchNode).filter(Boolean);
    }, [sectionsToManage, searchTerm]);

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

            <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                    <Tab icon={<ManageAccountsIcon fontSize="small" />} label="Datos" iconPosition="start" sx={{ minHeight: 48 }} />
                    <Tab icon={<ComputerIcon fontSize="small" />} label="Desktop" iconPosition="start" sx={{ minHeight: 48 }} />
                    <Tab icon={<PhoneAndroidIcon fontSize="small" />} label="Mobile" iconPosition="start" sx={{ minHeight: 48 }} />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                            Información del usuario
                        </Typography>
                        <Divider sx={{ mb: 3, mt: 0.5 }} />

                        <Stack spacing={2.5}>
                            <TextField label="Nombre" value={form.name} onChange={handleFormChange('name')} fullWidth size="small" />
                            <TextField label="Usuario" value={form.user} onChange={handleFormChange('user')} fullWidth size="small" />
                            <TextField
                                label="Contraseña" type={showPass ? 'text' : 'password'} value={form.pass} onChange={handleFormChange('pass')} fullWidth size="small" placeholder="Dejar vacío para no cambiar" helperText="Solo completa si deseas cambiar la contraseña"
                                InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPass(prev => !prev)} edge="end" size="small">{showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton></InputAdornment>) }}
                            />
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo</InputLabel>
                                <Select value={form.type} label="Tipo" onChange={handleFormChange('type')}>
                                    <MenuItem value="Administrativo">Administrativo</MenuItem>
                                    <MenuItem value="Driver">Driver</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado</InputLabel>
                                <Select value={String(form.active)} label="Estado" onChange={handleFormChange('active')}>
                                    <MenuItem value="1">Activo</MenuItem>
                                    <MenuItem value="0">Inactivo</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={() => onUpdateUser(user.id, form)} fullWidth>
                                Guardar
                            </Button>
                        </Stack>
                    </Box>
                )}

                {activeTab === 1 && (
                    featuresLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> : (
                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth placeholder="Buscar permiso..." variant="outlined" size="small"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
                                sx={{ mb: 2 }}
                            />
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                Configuración de Accesos
                            </Typography>
                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {filteredDesktopSections.map((section) => (
                                    <PermissionNode
                                        key={section.featureKey || section.name} node={section} level={0}
                                        desktopFeaturesMap={desktopFeaturesMap} onToggleFeature={onToggleFeature} userId={user.id}
                                        expandedSections={expandedSections} toggleSection={toggleSection} searchTerm={searchTerm}
                                    />
                                ))}
                            </List>
                        </Box>
                    )
                )}

                {activeTab === 2 && (
                    featuresLoading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                        : <FeatureSection features={featuresMobile} userId={user.id} onToggleFeature={onToggleFeature} />
                )}
            </Box>
        </Drawer>
    );
};

export default AccessDrawer;