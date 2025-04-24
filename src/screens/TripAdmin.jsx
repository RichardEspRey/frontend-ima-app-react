import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TablePagination } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import './css/TripAdmin.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const TripAdmin = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
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
        return matchesSearch && withinDateRange;
    });

    const handleEditTrip = (tripId) => {
        navigate(`/edit-trip/${tripId}`);
    };

    return (
        <div className="trip-admin">
            <h1 className="title">Administrador de Viajes</h1>

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
                    </Button>
                </div>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['TRIP NUMBER', 'TRUCK', 'TRAILER', 'DRIVER ID', 'COMPANY', 'CI NUMBER', 'STATUS', 'DATE', 'ACTIONS'].map((title, index) => (
                                <TableCell key={index}><strong>{title}</strong></TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filteredTrips.length} 
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />
        </div>
    );
};

export default TripAdmin;