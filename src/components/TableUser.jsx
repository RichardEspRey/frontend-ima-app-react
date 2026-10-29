import { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Box, Button, TablePagination, Typography, Chip,
    Tabs, Tab, Avatar, InputAdornment, Stack
} from '@mui/material';
import { Search as SearchIcon, ManageAccounts as ManageAccountsIcon } from '@mui/icons-material';
import {
    TABLE_CONTAINER_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABS_WRAPPER_SX, TAB_SX,
    PAGINATION_BOX_SX, PAGINATION_SX, CELL_STRONG_SX, CELL_MUTED_SX, CHIP_SX,
    CHIP_OK_SX, CHIP_DANGER_SX, GHOST_BTN_SX, INPUT_SX,
} from '../styles/estilosTabla';
import { isDriver } from '../utils/usuarios';


const PESTANAS = [
    { id: 'administradores', etiqueta: 'Administradores' },
    { id: 'drivers', etiqueta: 'Drivers' },
];

const iniciales = (nombre) => (nombre || 'U').split(' ').filter(Boolean).map(p => p[0]).join('').substring(0, 2).toUpperCase();

const estaActivo = (user) => String(user.active) === '1' || user.active === true || user.active === 1;

const TableUser = ({ users, onEditUser, soloDrivers = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pestana, setPestana] = useState(soloDrivers ? 'drivers' : 'administradores');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const pestanaActiva = soloDrivers ? 'drivers' : pestana;

    const conteo = useMemo(() => ({
        administradores: users.filter(u => !isDriver(u.type)).length,
        drivers: users.filter(u => isDriver(u.type)).length,
    }), [users]);

    const filteredUsers = useMemo(() => {
        const byTab = users.filter(u => (pestanaActiva === 'drivers' ? isDriver(u.type) : !isDriver(u.type)));
        if (!searchTerm) return byTab;

        const lower = searchTerm.toLowerCase();
        return byTab.filter(user =>
            user.name?.toLowerCase().includes(lower) ||
            user.user?.toLowerCase().includes(lower) ||
            user.type?.toLowerCase().includes(lower)
        );
    }, [users, pestanaActiva, searchTerm]);

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredUsers, page, rowsPerPage]);

    const pestanasVisibles = soloDrivers ? PESTANAS.filter(p => p.id === 'drivers') : PESTANAS;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                <Box sx={{ ...TABS_WRAPPER_SX, mb: 0 }}>
                    <Tabs
                        value={pestanaActiva}
                        onChange={(_e, valor) => { setPestana(valor); setPage(0); }}
                        TabIndicatorProps={{ style: { display: 'none' } }}
                    >
                        {pestanasVisibles.map(p => (
                            <Tab key={p.id} value={p.id} label={`${p.etiqueta} (${conteo[p.id]})`} sx={TAB_SX} />
                        ))}
                    </Tabs>
                </Box>

                <TextField
                    placeholder="Buscar por nombre, usuario o tipo"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                    }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    }}
                    sx={{ width: { xs: '100%', sm: 320 }, bgcolor: '#fff', '& .MuiOutlinedInput-root': INPUT_SX }}
                />
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>Usuario</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Tipo</TableCell>
                            <TableCell sx={HEADER_CELL_SX} align="center">Estado</TableCell>
                            <TableCell sx={HEADER_CELL_SX} align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700, bgcolor: isDriver(user.type) ? '#f5f3ff' : '#eef2ff', color: isDriver(user.type) ? '#6d28d9' : '#4338ca' }}>
                                            {iniciales(user.name)}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body2" sx={CELL_STRONG_SX} noWrap>{user.name}</Typography>
                                            <Typography variant="caption" sx={CELL_MUTED_SX} noWrap>{user.user}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Chip label={user.type} size="small" variant="outlined" sx={CHIP_SX} />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={estaActivo(user) ? 'Activo' : 'Inactivo'}
                                        size="small"
                                        sx={estaActivo(user) ? CHIP_OK_SX : CHIP_DANGER_SX}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<ManageAccountsIcon fontSize="small" />}
                                        onClick={() => onEditUser(user)}
                                        aria-label={`Gestionar accesos de ${user.name}`}
                                        sx={{ ...GHOST_BTN_SX, py: 0.5, px: 1.5 }}
                                    >
                                        Gestionar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748b' }}>
                                    {searchTerm ? 'Nadie coincide con la búsqueda.' : 'No hay usuarios en esta pestaña.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={PAGINATION_BOX_SX}>
                <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={(_e, nueva) => setPage(nueva)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Filas por página:"
                    sx={PAGINATION_SX}
                />
            </Box>
        </Box>
    );
};

export default TableUser;
