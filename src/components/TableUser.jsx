import { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Box, IconButton, TablePagination, Typography, Chip,
    Tabs, Tab
} from '@mui/material';
import { Settings as SettingsIcon, Search as SearchIcon } from '@mui/icons-material';

// "Driver" es la única categoría de chofer; cualquier otro tipo (Admin, Administrativo, etc.)
// se agrupa como Administradores, así los nombres inconsistentes en BD no rompen la división.
const isDriver = (type) => String(type || '').trim().toLowerCase() === 'driver';

const TableUser = ({ users, onEditUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tabIndex, setTabIndex] = useState(0); // 0 = Administradores, 1 = Drivers
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const adminCount = useMemo(() => users.filter(u => !isDriver(u.type)).length, [users]);
    const driverCount = useMemo(() => users.filter(u => isDriver(u.type)).length, [users]);

    const filteredUsers = useMemo(() => {
        const byTab = users.filter(u => (tabIndex === 1 ? isDriver(u.type) : !isDriver(u.type)));
        if (!searchTerm) return byTab;

        const lower = searchTerm.toLowerCase();
        return byTab.filter(user =>
            user.name?.toLowerCase().includes(lower) ||
            user.user?.toLowerCase().includes(lower) ||
            user.type?.toLowerCase().includes(lower)
        );
    }, [users, tabIndex, searchTerm]);

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredUsers, page, rowsPerPage]);

    const handleChangeTab = (event, newValue) => {
        setTabIndex(newValue);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Tabs
                value={tabIndex}
                onChange={handleChangeTab}
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label={`Administradores (${adminCount})`} />
                <Tab label={`Drivers (${driverCount})`} />
            </Tabs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Lista de Usuarios ({filteredUsers.length} resultados)</Typography>

                <TextField
                    label="Buscar por Nombre, Usuario o Tipo"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                    }}
                    InputProps={{
                        endAdornment: <SearchIcon color="action" />,
                    }}
                    sx={{ width: 300 }}
                />
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.user}</TableCell>
                                <TableCell>{user.type}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.active ? 'Activo' : 'Inactivo'}
                                        color={user.active ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => onEditUser(user)}
                                        aria-label={`Gestionar accesos de ${user.name}`}
                                    >
                                        <SettingsIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No se encontraron usuarios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filteredUsers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Filas por página:"
            />
        </Paper>
    );
};

export default TableUser;
