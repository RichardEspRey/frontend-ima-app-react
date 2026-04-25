import React, { useState, useMemo } from 'react';
import { 
    Drawer, Box, Typography, IconButton, 
    List, ListItem, ListItemText, ListItemIcon, Switch, 
    Avatar, TextField, Chip, Stack, Collapse
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Search as SearchIcon, 
    Security as SecurityIcon,
    SubdirectoryArrowRight as SubIcon,
    ExpandLess, ExpandMore
} from '@mui/icons-material';

const PermissionDrawer = ({ open, handleClose, user, sectionsToManage, handlePermissionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    const filteredSections = useMemo(() => {
        if (!sectionsToManage) return []; 
        if (!searchTerm) return sectionsToManage;
        
        const lower = searchTerm.toLowerCase();
        
        return sectionsToManage.filter(section => {
            const matchSection = section.name.toLowerCase().includes(lower);
            const matchSub = section.subItems?.some(sub => sub.name.toLowerCase().includes(lower));
            return matchSection || matchSub;
        });
    }, [sectionsToManage, searchTerm]);

    const toggleSection = (sectionName) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    };

    if (!user) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 450 }, padding: 0 }
            }}
        >
            {/* CABECERA */}
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
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
                                {user.email}
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

            {/* CONTENIDO */}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                <TextField
                    fullWidth
                    placeholder="Buscar permiso..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={{ mb: 2 }}
                />

                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                    Configuración de Accesos
                </Typography>

                <List sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto', flex: 1 }}>
                    {filteredSections.map((section) => {
                        const hasSubItems = section.subItems && section.subItems.length > 0;
                        const permissionKey = section.name;
                        const isAllowed = user.permissions[permissionKey] !== undefined ? user.permissions[permissionKey] : false;

                        return (
                            <React.Fragment key={section.name}>
                                {/* PADRE */}
                                <ListItem 
                                    divider 
                                    sx={{ 
                                        bgcolor: isAllowed ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                                        borderLeft: isAllowed ? '4px solid #1976d2' : '4px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <SecurityIcon color={isAllowed ? "primary" : "disabled"} />
                                    </ListItemIcon>
                                    
                                    <ListItemText 
                                        primary={section.name} 
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                        secondary={hasSubItems ? "Desplegar para ver opciones" : "Acceso a pantalla completa"}
                                    />
                                    
                                    <Switch
                                        edge="end"
                                        checked={isAllowed}
                                        onChange={(e) => handlePermissionChange(user.id, permissionKey, e.target.checked)}
                                        color="primary"
                                    />
                                    
                                    {hasSubItems && (
                                        <IconButton 
                                            onClick={() => toggleSection(section.name)}
                                            size="small" 
                                            sx={{ ml: 1 }}
                                        >
                                            {expandedSections[section.name] || searchTerm ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    )}
                                </ListItem>

                                {/* HIJOS (Subitems / Pestañas) */}
                                {hasSubItems && (
                                    <Collapse in={expandedSections[section.name] || searchTerm.length > 0} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding sx={{ bgcolor: '#fafafa' }}>
                                            {section.subItems.map((subItem) => {
                                                const subKey = subItem.name;
                                                const isSubAllowed = user.permissions[subKey] !== undefined ? user.permissions[subKey] : false;

                                                return (
                                                    <ListItem key={subKey} sx={{ pl: 4 }}>
                                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                                            <SubIcon fontSize="small" color="action" />
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={subItem.name} 
                                                            secondary={!subItem.route ? "Control de Pestaña/Vista" : "Sub-menú de navegación"}
                                                            primaryTypographyProps={{ variant: 'body2' }}
                                                            secondaryTypographyProps={{ variant: 'caption', color: !subItem.route ? 'secondary' : 'textSecondary' }}
                                                        />
                                                        <Switch
                                                            size="small"
                                                            edge="end"
                                                            checked={isSubAllowed}
                                                            disabled={!isAllowed} 
                                                            onChange={(e) => handlePermissionChange(user.id, subKey, e.target.checked)}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
};

export default PermissionDrawer;