import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, TablePagination } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

const drivers = [
    { id: "08-2025", ccp: "002", truck: "002", trailer: "BIND61794", assigned_to: "MANUEL JIMENEZ", customer: "BIMBO", ci_number: "CBI2SAADBNB", invoice: "844", status: "Active", date: new Date(2025, 0, 31), name: "Roberto Arreola" },
    { id: "07-2025", ccp: "002", truck: "002", trailer: "BIND61794", assigned_to: "ROBERTO LOPEZ", customer: "BIMBO", ci_number: "CBI2SAADBNB", invoice: "844", status: "On Route", date: new Date(2025, 0, 31), name: "Manuel Jimenez" },
    { id: '06-2025', ccp: '002', truck: '002', trailer: 'BIND61794', assigned_to: 'ANDRES CARILLO', customer: 'BIMBO', ci_number: 'CBI2SAADBNB', invoice: '844', status: 'On Route', date: new Date(2025, 0, 25), name: 'Roberto Lopez' },
    { id: '05-2025', ccp: '002', truck: '002', trailer: 'BIND61794', assigned_to: 'MANUEL JIMENEZ', customer: 'BIMBO', ci_number: 'CBI2SAADBNB', invoice: '844', status: 'On Route', date: new Date(2025, 0, 1), name: 'Vicente Lara' },
    { id: '04-2025', ccp: '002', truck: '002', trailer: 'BIND61794', assigned_to: 'MANUEL JIMENEZ', customer: 'BIMBO', ci_number: 'CBI2SAADBNB', invoice: '844', status: 'On Route', date: new Date(2025, 0, 31), name: 'Julian Vela' },
    { id: '03-2025', ccp: '002', truck: '002', trailer: 'BIND61794', assigned_to: 'ALEJANDRO RODRIGUEZ', customer: 'BIMBO', ci_number: 'CBI2SAADBNB', invoice: '844', status: 'Active', date: new Date(2024, 1, 22), name: 'Andres Gonzalez' },
    { id: '02-2025', ccp: '002', truck: '002', trailer: 'BIND61794', assigned_to: 'MANUEL JIMENEZ', customer: 'BIMBO', ci_number: 'CBI2SAADBNB', invoice: '844', status: 'Out of Service', date: new Date(2024, 1, 31), name: 'Alejandro Arenas' },
    { id: '01-2025', ccp: '002', truck: '002', trailer: 'BIND61794', assigned_to: 'MANUEL JIMENEZ', customer: 'BIMBO', ci_number: 'CBI2SAADBNB', invoice: '844', status: 'On Vacation', date: new Date(2024, 0, 31), name: 'Luis Vazquez' }
];

const TripAdmin = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.assigned_to.toLowerCase().includes(search.toLowerCase());
        const withinDateRange = startDate && endDate ? driver.date >= startDate && driver.date <= endDate : true;
        return matchesSearch && withinDateRange;
    });

    return (
        <div>
            <h1>Administrador de Viajes</h1>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField 
                    label="Buscar por nombre" 
                    variant="outlined" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
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
                <Button variant="contained" onClick={() => { setStartDate(null); setEndDate(null); }}>Limpiar Filtro</Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['TRIP NUMBER', 'CCP', 'TRUCK', 'TRAILER', 'ASSIGNED TO', 'CUSTOMER', 'CI NUMBER', 'INVOICE', 'STATUS', 'DATE'].map((title, index) => (
                                <TableCell key={index}><strong>{title}</strong></TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDrivers.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(driver => (
                            <TableRow key={driver.id}>
                                <TableCell>{driver.id}</TableCell>
                                <TableCell>{driver.ccp}</TableCell>
                                <TableCell>{driver.truck}</TableCell>
                                <TableCell>{driver.trailer}</TableCell>
                                <TableCell>{driver.assigned_to}</TableCell>
                                <TableCell>{driver.customer}</TableCell>
                                <TableCell>{driver.ci_number}</TableCell>
                                <TableCell>{driver.invoice}</TableCell>
                                <TableCell>{driver.status}</TableCell>
                                <TableCell>{dayjs(driver.date).format("MM/DD/YYYY")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination 
                component="div" 
                count={filteredDrivers.length} 
                page={page} 
                onPageChange={(_, newPage) => setPage(newPage)} 
                rowsPerPage={rowsPerPage} 
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} 
            />
        </div>
    );
};

export default TripAdmin;
