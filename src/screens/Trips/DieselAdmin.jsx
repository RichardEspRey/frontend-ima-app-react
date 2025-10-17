import React, { useState, useEffect } from 'react';
import '../css/DriverAdmin.css';
import { useNavigate } from 'react-router-dom';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button'; 

const DieselAdmin = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [registros, setRegistros] = useState([]);

  const fetchDiesel = async () => {
    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getAll_diesel'
      });
      const data = await response.json();
      if (data.status === 'success') {
        const formatted = data.id.map(t => ({
          trip_number: t.trip_number,
          trip_id: t.trip_id,
          fecha: t.fecha,
          monto: t.monto,
          odometro: t.odometro,
          galones: t.galones,
          nombre: t.nombre
        }));
        setRegistros(formatted);
      }
    } catch (error) {
      console.error('Error al obtener diesel:', error);
    }
  };

  useEffect(() => { fetchDiesel(); }, []);

  const handleVer = (tripId) => {
    navigate(`/detalle-diesel/${tripId}`); 
  };

  return (
    <div className="driver-admin">
      <h1 className="title">Diesel Management System</h1>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 20}} align="center">Trip</TableCell>
        
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 20}} align="center">Last Update</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 20}} align="center">Travelled mi.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 20}} align="center">Total gal.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 20}} align="center">Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 20}} align="center">Driver</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 20}} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((row) => ( 
              <TableRow key={row.trip_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.trip_number}</TableCell>

                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.fecha}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.odometro}mi</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.galones}gal</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>
                  {`$${Number(row.monto || 0).toFixed(2)}`}
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.nombre}</TableCell>
                <TableCell align="center" >
                  <Button variant="text" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 18}} onClick={() => handleVer(row.trip_id)}>View</Button> 
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DieselAdmin;
