<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TablePagination } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import './css/TripAdmin.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
=======
import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Link as MuiLink, Tooltip, IconButton, Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownloadIcon from '@mui/icons-material/Download';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import './css/TripAdmin.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx'; // Asegúrate de importar XLSX
>>>>>>> Aldayr

// ... (El componente TripRow permanece igual)
const TripRow = ({ trip, onEdit, onFinalize, getDocumentUrl }) => {
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            {/* Fila principal con datos básicos */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                {/* Celda para el botón de expandir/colapsar */}
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {/* Celdas con datos principales */}
                <TableCell component="th" scope="row">{trip.trip_number}</TableCell>
                <TableCell>{trip.driver_nombre || trip.driver_id || '-'}</TableCell>
                <TableCell>{trip.truck_unidad || trip.truck_id || '-'}</TableCell>
                <TableCell>{trip.caja_no_caja || trip.caja_id || 'N/A'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {trip.creation_date ? dayjs(trip.creation_date).format("DD/MM/YYYY HH:mm") : '-'}
                </TableCell>
                <TableCell>
                    <span className={`status-${(trip.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                        {trip.status || 'Pending'}
                    </span>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}> {/* Usar flex y gap reducido */}
                        <Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>
                            Editar
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => onFinalize(trip.trip_id, trip.trip_number)}
                            disabled={trip.status === 'Completed' || trip.status === 'Cancelled'}
                            sx={{ fontSize: '0.75rem' }}
                        >
                            Finalizar
                        </Button>
                    </Box>
                </TableCell>
            </TableRow>
            {/* Fila secundaria que contiene el contenido colapsable */}
            <TableRow>
                {/* Celda que abarca todas las columnas y contiene el Collapse */}
                {/* El +1 en colSpan es por la nueva celda del IconButton */}
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 1, border: '1px solid rgba(224, 224, 224, 1)', borderRadius: '4px' }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                Detalles de Etapas y Documentos
                            </Typography>
                            {/* Renderizar etapas y documentos aquí */}
                            {Array.isArray(trip.etapas) && trip.etapas.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                                    {trip.etapas.map((etapa) => (
                                        <li key={etapa.trip_stage_id} style={{ marginBottom: '10px' }}>
                                            <Tooltip title={`Compañía: ${etapa.nombre_compania || '-'}\nBodega Origen: ${etapa.warehouse_origin_name || '-'}\nBodega Destino: ${etapa.warehouse_destination_name || '-'}\nTarifa: ${etapa.rate_tarifa || '-'}\nMillas: ${etapa.millas_pcmiller || '-'}`} arrow>
                                                <span>
                                                    <strong>E{etapa.stage_number} ({etapa.stageType?.replace('borderCrossing', 'Cruce').replace('normalTrip', 'Normal') || 'N/A'}):</strong> {etapa.origin} &rarr; {etapa.destination} ({etapa.travel_direction})
                                                </span>
                                            </Tooltip>
                                            {/* Mostrar CI Number de la etapa */}
                                            {etapa.ci_number && <><br/><span style={{fontSize: '0.9em', color: '#555'}}>CI: {etapa.ci_number}</span></>}
                                            {/* Fechas */}
                                            <br/>
                                            <span style={{fontSize: '0.9em', color: '#555'}}>
                                                Carga: {etapa.loading_date ? dayjs(etapa.loading_date).format("DD/MM/YY") : '-'} |
                                                Entrega: {etapa.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '-'}
                                            </span>
                                            {/* Documentos */}
                                            {Array.isArray(etapa.documentos_adjuntos) && etapa.documentos_adjuntos.length > 0 && (
                                                <ul style={{ margin: '2px 0 0 15px', paddingLeft: '15px', listStyleType: 'disc' }}>
                                                    {etapa.documentos_adjuntos.map(doc => (
                                                        <li key={doc.document_id}>
                                                            {/* Usar getDocumentUrl para generar el enlace */}
                                                            <MuiLink
                                                                href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)} // Priorizar path_servidor_real si existe
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title={`Ver ${doc.tipo_documento} (${doc.nombre_archivo})`}
                                                                underline="hover"
                                                                sx={{fontSize: 'inherit'}}
                                                            >
                                                                {doc.tipo_documento.replace(/_/g, ' ')}
                                                            </MuiLink>
                                                            {doc.fecha_vencimiento ? ` (V: ${dayjs(doc.fecha_vencimiento).format("DD/MM/YY")})` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Sin etapas registradas</Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};


// Componente Principal TripAdmin
const TripAdmin = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
<<<<<<< HEAD
    const [trips, setTrips] = useState([]);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await fetch('http://localhost/api/trips.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'op=getAll',
                });
                
                const data = await response.json();
                
                if (data.status === 'success' && data.trips) {
                    console.log(data.trips)
                    const formattedTrips = data.trips.map(trip => ({
                        trip_id: trip.trip_id.toString(),
                        trip_number: trip.trip_number,
                        truck_unidad: trip.truck_unidad || '',
                        caja_no_caja: trip.caja_no_caja || '',
                        driver_name: trip.driver_name || '',
                        nombre_compania: trip.nombre_compania || '',
                        company_name: trip.company_name || '',
                        ci_number: trip.ci_number || '',
                        estatus: trip.estatus || '',
                        creation_date: trip.creation_date ? new Date(trip.creation_date) : null,
                       
                    }));
                    setTrips(formattedTrips);
                } else {
                    console.error('Error al obtener los viajes:', data.message || 'Respuesta inesperada del servidor');
                }
            } catch (error) {
                console.error('Error de red al obtener los viajes:', error);
            }
        };

        fetchTrips();
    }, []);

    const filteredTrips = trips.filter(trip => { // Usar 'trips' y renombrar a 'filteredTrips'
        const matchesSearch =
            (trip.trip_id || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.trip_number || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.truck_unidad || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.driver_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.caja_no_caja || '').toLowerCase().includes(search.toLowerCase()) 
            (trip.nombre_compania || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.ci_number || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.estatus || '').toLowerCase().includes(search.toLowerCase()) ||
            (trip.creation_date || '').toLowerCase().includes(search.toLowerCase());
        const withinDateRange = startDate && endDate ? trip.date >= startDate && trip.date <= endDate : true;
=======
    const navigate = useNavigate();

    const API_BASE_URL = `${apiHost}/new_trips.php`;

    const fetchTrips = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = API_BASE_URL;
            const formData = new FormData();
            formData.append('op', 'getAll');
            const response = await fetch(apiUrl, { method: 'POST', body: formData });
            const responseText = await response.text();
            console.log("Respuesta cruda de getAll:", responseText);
            let result;
            try {
                result = JSON.parse(responseText);
                if (result.trips && Array.isArray(result.trips)) {
                    result.trips.forEach(trip => {
                        if (typeof trip.etapas === 'string') {
                            try {
                                trip.etapas = JSON.parse(trip.etapas);
                            } catch (e) {
                                console.error(`Error parseando etapas para Trip ID ${trip.trip_id}:`, trip.etapas, e);
                                trip.etapas = [];
                            }
                        }
                        if (trip.etapas && Array.isArray(trip.etapas)) {
                            trip.etapas.forEach(etapa => {
                                if (typeof etapa.documentos_adjuntos === 'string') {
                                    try {
                                        etapa.documentos_adjuntos = JSON.parse(etapa.documentos_adjuntos);
                                    } catch (e) {
                                        console.error(`Error parseando documentos para Etapa ID ${etapa.trip_stage_id}:`, etapa.documentos_adjuntos, e);
                                        etapa.documentos_adjuntos = [];
                                    }
                                }
                            });
                        }
                    });
                }
            }
            catch (e) {
                console.error("Error parseando JSON:", e, "Respuesta recibida:", responseText);
                throw new Error(`Respuesta inválida del servidor. Verifica la consola y el log PHP.`);
            }

            if (response.ok && result.status === "success") {
                setTrips(Array.isArray(result.trips) ? result.trips : []);
            } else {
                throw new Error(result.message || result.error || 'Error al obtener los viajes.');
            }
        } catch (err) {
            console.error("Error fetching trips:", err);
            setError(err.message);
            Swal.fire('Error', `No se pudieron cargar los viajes: ${err.message}`, 'error');
            setTrips([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrips(); }, []);


    const getDocumentUrl = (serverPath) => {
        console.log("getDocumentUrl - serverPath recibido:", serverPath);
        if (!serverPath || typeof serverPath !== 'string') {
            console.warn("getDocumentUrl - Ruta inválida o vacía recibida.");
            return '#';
        }
        const webRootPath = '/API/Uploads/trips/';
        const fileName = serverPath.split(/[\\/]/).pop();
        if (!fileName) {
            console.warn("getDocumentUrl - No se pudo extraer el nombre del archivo de:", serverPath);
            return '#';
        }
        const finalUrl = `${webRootPath}${encodeURIComponent(fileName)}`;
        console.log("getDocumentUrl - URL generada:", finalUrl);
        return finalUrl;
    };

    const filteredTrips = useMemo(() => trips.filter(trip => {
        let tripCreationDate = null;
        if (trip.creation_date) { try { tripCreationDate = new Date(trip.creation_date); if (isNaN(tripCreationDate.getTime())) { tripCreationDate = null; } } catch (e) { } }
        const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
        const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
        const withinDateRange = ((!start || (tripCreationDate && tripCreationDate >= start)) && (!end || (tripCreationDate && tripCreationDate <= end)));
        const searchLower = search.toLowerCase();
        const matchesSearch = search === "" || (
            (trip.trip_id?.toString() || '').toLowerCase().includes(searchLower) ||
            (trip.trip_number || '').toLowerCase().includes(searchLower) ||
            (trip.driver_nombre || '').toLowerCase().includes(searchLower) ||
            (trip.truck_unidad || '').toLowerCase().includes(searchLower) ||
            (trip.caja_no_caja || '').toLowerCase().includes(searchLower) ||
            (trip.status || '').toLowerCase().includes(searchLower) ||
            (trip.etapas && trip.etapas.some(etapa => // Buscar en CUALQUIER etapa
                (etapa.ci_number || '').toLowerCase().includes(searchLower) ||
                (etapa.origin || '').toLowerCase().includes(searchLower) ||
                (etapa.destination || '').toLowerCase().includes(searchLower) ||
                (etapa.nombre_compania || '').toLowerCase().includes(searchLower)
            ))
        );
>>>>>>> Aldayr
        return matchesSearch && withinDateRange;
    }), [trips, search, startDate, endDate]);

    const handleEditTrip = (tripId) => {
        if (!tripId) { console.error("ID inválido"); return; }
        navigate(`/edit-trip/${tripId}`);
    };

    const handleFinalizeTrip = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirmation = await Swal.fire({
            title: '¿Finalizar Viaje?', text: `Viaje #${tripNumber} será completado.`,
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, finalizar'
        });
        if (confirmation.isConfirmed) {
            try {
                const apiUrl = API_BASE_URL;
                const finalizeFormData = new FormData();
                finalizeFormData.append('op', 'FinalizeTrip');
                finalizeFormData.append('trip_id', tripId);
                const response = await fetch(apiUrl, { method: 'POST', body: finalizeFormData });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    Swal.fire('¡Finalizado!', result.message || 'Viaje completado.', 'success');
                    fetchTrips();
                } else { throw new Error(result.error || result.message || 'No se pudo finalizar.'); }
            } catch (err) { Swal.fire('Error', `Error al finalizar: ${err.message}`, 'error'); }
        }
    };

    const handleDownloadExcel = () => {
        console.log("Preparando descarga Excel para", filteredTrips.length, "viajes filtrados.");
        if (filteredTrips.length === 0) {
            Swal.fire('Info', 'No hay viajes filtrados para descargar.', 'info');
            return;
        }

        // 1. Determinar el número máximo de etapas en los viajes filtrados
        let maxEtapas = 0;
        if (filteredTrips.length > 0) {
            filteredTrips.forEach(trip => {
                if (trip.etapas && trip.etapas.length > maxEtapas) {
                    maxEtapas = trip.etapas.length;
                }
            });
        }
        console.log("Máximo de etapas encontradas:", maxEtapas);

        const dataForExcel = filteredTrips.map(trip => {
            const row = {
                'Trip #': trip.trip_number,
                'Driver': trip.driver_nombre || trip.driver_id || '-',
                'Truck': trip.truck_unidad || trip.truck_id || '-',
                'Trailer': trip.caja_no_caja || trip.caja_id || 'N/A',
                'Creado': trip.creation_date ? dayjs(trip.creation_date).format("DD/MM/YYYY HH:mm") : '-',
                'Status': trip.status || 'Pending',
            };

            // Añadir datos de cada etapa dinámicamente
            // Iterar hasta el número máximo de etapas encontradas en cualquier viaje
            for (let i = 0; i < maxEtapas; i++) {
                const etapa = trip.etapas?.[i]; // Acceso seguro a la etapa (puede no existir para este trip)
                const etapaNum = i + 1; // El número de etapa para el encabezado de columna

                // Usar etapa?.property para evitar errores si la etapa no existe o no tiene esa propiedad
                row[`Etapa ${etapaNum} - Tipo`] = etapa?.stageType?.replace('borderCrossing', 'Cruce').replace('normalTrip', 'Normal') || '-';
                row[`Etapa ${etapaNum} - Origen`] = etapa?.origin || '-';
                row[`Etapa ${etapaNum} - Destino`] = etapa?.destination || '-';
                row[`Etapa ${etapaNum} - CI`] = etapa?.ci_number || '-';
                row[`Etapa ${etapaNum} - Compañía`] = etapa?.nombre_compania || '-';
                row[`Etapa ${etapaNum} - Dir.`] = etapa?.travel_direction || '-';
                row[`Etapa ${etapaNum} - Tarifa`] = etapa?.rate_tarifa || '-';
                row[`Etapa ${etapaNum} - Millas`] = etapa?.millas_pcmiller || '-';
                row[`Etapa ${etapaNum} - Bod. Origen`] = etapa?.warehouse_origin_name || '-';
                row[`Etapa ${etapaNum} - Bod. Destino`] = etapa?.warehouse_destination_name || '-';
                row[`Etapa ${etapaNum} - Carga`] = etapa?.loading_date ? dayjs(etapa.loading_date).format("DD/MM/YY") : '-';
                row[`Etapa ${etapaNum} - Entrega`] = etapa?.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '-';
            }
            return row;
        });

        try {
            const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Viajes');

            if (dataForExcel.length > 0) {
                const columnWidths = Object.keys(dataForExcel[0]).map(key => ({
                    wch: Math.max(
                        key.length,
                        ...dataForExcel.map(row => (row[key]?.toString() || '').length)
                    ) + 2
                }));
                worksheet['!cols'] = columnWidths;
            }

            const excelFileName = `Reporte_Viajes_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`;
            XLSX.writeFile(workbook, excelFileName);
            console.log("Descarga Excel iniciada:", excelFileName);

        } catch (excelError) {
            console.error("Error generando Excel:", excelError);
            Swal.fire('Error', 'No se pudo generar el archivo Excel.', 'error');
        }
    };

    if (loading) { return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando...</Typography> </Box> ); }

    const handleEditTrip = (tripId) => {
        navigate(`/edit-trip/${tripId}`);
    };

    return (
        <div className="trip-admin">
            <h1 className="title">Administrador de Viajes</h1>
<<<<<<< HEAD

            <div className="filters">
                <input
                    type="text"
                    placeholder="Buscar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="small-input"
                />
                <div className="date-pickers">
                    <DatePicker
                        selected={startDate}
                        onChange={setStartDate}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Fecha inicio"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={setEndDate}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Fecha fin"
                    />
                    <Button variant="contained" onClick={() => { setStartDate(null); setEndDate(null); }} style={{ marginLeft: '10px' }}>
                        Limpiar Filtro
=======
            <div className="filters">
                <input type="text" placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} className="small-input" />
                <div className="date-pickers">
                    <DatePicker selected={startDate} onChange={setStartDate} selectsStart startDate={startDate} endDate={endDate} placeholderText="Fecha inicio" dateFormat="dd/MM/yyyy" wrapperClassName="date-picker-wrapper" isClearable />
                    <DatePicker selected={endDate} onChange={setEndDate} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} placeholderText="Fecha fin" dateFormat="dd/MM/yyyy" wrapperClassName="date-picker-wrapper" isClearable />
                    <Button variant="contained" onClick={() => { setStartDate(null); setEndDate(null); }} style={{ marginLeft: '10px' }} size="small"> Limpiar Filtro </Button>
                    <Button variant="contained" onClick={fetchTrips} disabled={loading} style={{ marginLeft: '10px' }} size="small"> Refrescar </Button>
                    <Button
                        variant="contained"
                        onClick={handleDownloadExcel}
                        disabled={loading || filteredTrips.length === 0}
                        style={{ marginLeft: '10px' }}
                        size="small"
                        startIcon={<DownloadIcon />}
                    >
                        Descargar Excel
>>>>>>> Aldayr
                    </Button>
                </div>
            </div>
            {error && <Alert severity="error" sx={{ my: 2 }}>Error al cargar: {error}</Alert>}

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
<<<<<<< HEAD
                            {['TRIP NUMBER', 'TRUCK', 'TRAILER', 'DRIVER ID', 'COMPANY', 'CI NUMBER', 'STATUS', 'DATE', 'ACTIONS'].map((title, index) => (
                                <TableCell key={index}><strong>{title}</strong></TableCell>
=======
                            <TableCell />
                            {['Trip #', 'Driver', 'Truck', 'Trailer', 'Creado', 'Status', 'Acciones'].map((title) => (
                                <TableCell key={title} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{title}</TableCell>
>>>>>>> Aldayr
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
<<<<<<< HEAD
                        {filteredTrips.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(trip => ( // Usar 'filteredTrips' y 'trip'
                            <TableRow key={trip.trip_id}>
                                <TableCell>{trip.trip_number}</TableCell>
                                <TableCell>{trip.truck_unidad}</TableCell>
                                <TableCell>{trip.caja_no_caja}</TableCell>
                                <TableCell>{trip.driver_name}</TableCell>
                                <TableCell>{trip.nombre_compania}</TableCell>
                                <TableCell>{trip.ci_number}</TableCell>
                                <TableCell>{trip.estatus}</TableCell> 
                                <TableCell>{dayjs(trip.creation_date).format("MM/DD/YYYY")}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => handleEditTrip(trip.id)}>Editar</Button> 
                                </TableCell>
=======
                        {filteredTrips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No se encontraron viajes con los filtros aplicados.</TableCell>
>>>>>>> Aldayr
                            </TableRow>
                        ) : (
                            filteredTrips
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((trip) => (
                                    <TripRow
                                        key={trip.trip_id}
                                        trip={trip}
                                        onEdit={handleEditTrip}
                                        onFinalize={handleFinalizeTrip}
                                        getDocumentUrl={getDocumentUrl}
                                    />
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
<<<<<<< HEAD
                component="div"
                count={filteredTrips.length} 
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
=======
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredTrips.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
>>>>>>> Aldayr
            />
        </div>
    );
};

export default TripAdmin;