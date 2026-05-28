import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, IconButton, TablePagination, Box } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; 

const apiHost = import.meta.env.VITE_API_HOST;

const renderDocIcon = (req, val) => {
    if (req.tipo === 'text') {
        return val?.valor_texto ? <Typography variant="body2" fontWeight={600} color="primary" noWrap>{val.valor_texto}</Typography> : <Typography variant="body2" color="text.disabled">-</Typography>;
    }

    if (!val || (!val.url_pdf && !val.valor_texto)) {
        return <Tooltip title="Faltante"><HelpOutlineIcon sx={{ color: '#cbd5e1' }} /></Tooltip>;
    }

    if (req.tiene_vencimiento == 1 && val.fecha_vencimiento) {
        const diff = Math.floor((new Date(val.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return <Tooltip title={`Vencido: ${val.fecha_vencimiento}`}><ErrorIcon color="error" /></Tooltip>;
        if (diff <= 30) return <Tooltip title={`Vence pronto: ${val.fecha_vencimiento}`}><WarningIcon color="warning" /></Tooltip>;
    }
    
    return (
        <Tooltip title={val.fecha_vencimiento ? `Vigente hasta ${val.fecha_vencimiento}` : 'Archivo adjunto'}>
            <a href={`${apiHost}/${val.url_pdf}`} target="_blank" rel="noreferrer" style={{color: 'inherit'}}>
                <CheckCircleIcon color="success" sx={{ '&:hover': { opacity: 0.7 } }} />
            </a>
        </Tooltip>
    );
};

const DriverTable = ({ filteredDrivers, visibleConfigFields, page, setPage, rowsPerPage, setRowsPerPage, openDriverEditor, deleteDriver }) => {
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer sx={{ overflowX: 'auto' }}> 
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 150 }}>Nombre</TableCell>
                            {visibleConfigFields.map(req => (
                                <TableCell key={req.key_name} align="center" sx={{ fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                                    <Tooltip title={req.label}>
                                        <span>{req.label.length > 12 ? req.label.substring(0, 12) + '...' : req.label}</span>
                                    </Tooltip>
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', minWidth: 100 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDrivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(driver => (
                            <TableRow key={driver.driver_id} hover>
                                <TableCell>{driver.driver_id}</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{driver.nombre}</TableCell>
                                {visibleConfigFields.map(req => (
                                    <TableCell key={req.key_name} align="center" sx={{ maxWidth: 100 }}>
                                        {renderDocIcon(req, driver.docs?.[req.key_name])}
                                    </TableCell>
                                ))}
                                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                    <IconButton size="small" color="primary" onClick={() => openDriverEditor(driver)}><EditOutlinedIcon /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => deleteDriver(driver.driver_id)}><DeleteOutlineIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredDrivers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={visibleConfigFields.length + 3} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">No se encontraron conductores.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={filteredDrivers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Conductores por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
        </Paper>
    );
};

export default DriverTable;