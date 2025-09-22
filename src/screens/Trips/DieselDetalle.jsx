import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button'; 
import { useNavigate } from 'react-router-dom';

const DieselDetalle = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const apiHost = import.meta.env.VITE_API_HOST;
  const [registros, setRegistros] = useState([]);

const fetchDiesel = async () => {
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('op', 'get_registers_diesel'); // o 'Editar' como lo uses tú
        formDataToSend.append('trip_id', tripId);

      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: formDataToSend
      });
      const data = await response.json();
      if (data.status === 'success') {
        const formatted = data.id.map(t => ({
          trip_number: t.trip_number,
          id: t.id,
          trip_id: t.trip_id,
          fecha: t.fecha,
          monto: t.monto,
          odometro: t.odometro,
          galones: t.galones,
          nombre: t.nombre,
          estado: t.estado,
          fleetone: t.fleetone
        }));
        setRegistros(formatted);
      }
    } catch (error) {
      console.error('Error al obtener diesel:', error);
    }
  };

  useEffect(() => { fetchDiesel(); }, []);

   const handleVer = (id, trip_id) => {
    navigate(`/editor-diesel/${id}/${trip_id}`);
  };
  
   const cancelar = () =>{
    navigate(`/admin-diesel`)
  }

  return (
   <div className="driver-admin">
      <h1 className="title">Detalle de diesel</h1>
       <div className="btnConteiner">
          <button className="btn cancelar" onClick={cancelar}> Volver al admin</button>
        </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Trip number</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Trip ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Fecha de modificacion</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Odometro al momento</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Galones</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Monto</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Driver</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Fleetone</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 16}} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((row) => ( 
              <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.trip_number}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.trip_id}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.fecha}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.odometro}mi</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.galones}gal</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>${row.monto}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.nombre}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.estado}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18}}>{row.fleetone}</TableCell>
                <TableCell align="center" >
                  <Button variant="text" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 18}} onClick={() => handleVer(row.id, row.trip_id)}>Editar</Button> {/* 👈 aquí navegas */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DieselDetalle;
