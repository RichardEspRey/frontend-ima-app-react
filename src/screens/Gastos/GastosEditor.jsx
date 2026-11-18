import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, TextField, InputAdornment } from '@mui/material';
import Swal from 'sweetalert2';
import { CargandoEditor, EditorShell, ResumenRegistro, TarjetaEditor, TicketsGaleria } from '../../components/EditorRegistro';
import { INPUT_SX } from '../../styles/estilosTabla';

const apiHost = import.meta.env.VITE_API_HOST;

const dinero = (valor) =>
  valor === '' || valor === null || valor === undefined
    ? ''
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(valor) || 0);

const campo = { fullWidth: true, size: 'small', InputProps: { sx: INPUT_SX } };

const GastoEditor = () => {
  const navigate = useNavigate();
  const { id, trip_id } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    id: '',
    trip_id: '',
    nombre: '',
    tipo_gasto: '',
    monto: '',
    trip_number: '' 
  });

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ** LÓGICA DE ACTUALIZACIÓN **
  const actualizar = async () => {
    try {
      const required = ["tipo_gasto", "monto"];
      const vacios = required.filter(
        k => String(formData[k] ?? "").trim() === ""
      );
      if (vacios.length) {
        Swal.fire({
          icon: "warning",
          title: "Campos vacíos",
          text: `Faltan: ${vacios.join(", ")}`,
        });
        return;
      }

      const montoNum = Number(formData.monto);

      if (!Number.isFinite(montoNum) || montoNum <= 0) {
        Swal.fire({ icon: "warning", title: "Monto inválido", text: "Debe ser un número mayor a 0." });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("op", "edit_gasto");
      formDataToSend.append("id", formData.id);
      formDataToSend.append("trip_id", formData.trip_id);
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("tipo_gasto", formData.tipo_gasto);
      formDataToSend.append("monto", String(montoNum));

      const response = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: formDataToSend,
      });
      
      const result = await response.json();

      if (result.status === "success" && result.row?.[0]?.resp == 1) {
        await Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Cambios realizados con éxito.",
            timer: 1500,
            showConfirmButton: false
        });
        navigate(`/detalle-gastos/${trip_id}`);
      } else {
        throw new Error("Error al guardar datos básicos");
      }
      
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  // ** LÓGICA DE ELIMINACIÓN **
  const eliminar = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({ title: 'Eliminando…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const formData = new FormData();
      formData.append('op', 'delete_gasto');
      formData.append('id', id); 

      const resp = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: formData });
      const data = await resp.json();
      Swal.close();

      if (data.status === 'success') {
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Registro eliminado correctamente.', timer: 1500, showConfirmButton: false });
        if (trip_id) {
          navigate(`/detalle-gastos/${trip_id}`);
        } else {
          navigate('/admin-gastos'); 
        }
      } else {
        throw new Error(data.message || 'No se pudo eliminar el registro');
      }
    } catch (err) {
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Ocurrió un problema al eliminar.' });
    }
  };

  // ** FETCH DATA **
  const fetchRegisters = useCallback(async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'get_gasto');
      formDataToSend.append('id', id);
      formDataToSend.append('trip_id', trip_id);

      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
    
      if (data.status === 'success' && data.row && data.row[0]) {
        const row = data.row[0];
        setFormData({
          id: row.id || '',
          trip_number: row.trip_number || '',
          trip_id: row.trip_id || '',
          monto: row.monto || '',
          fecha: row.fecha || '',
          tipo_gasto: row.tipo_gasto || '',
          nombre: row.nombre || ''
        });
      }

      // Fetch Tickets
      const fdTick = new FormData();
      fdTick.append('op', 'getTickets');
      fdTick.append('id', id);
      fdTick.append('trip_id', trip_id);
      fdTick.append('opcion', 'gasto');

      const respTick = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fdTick });
      const jsonTick = await respTick.json();

      if (jsonTick.status === 'success' && Array.isArray(jsonTick.data)) {
        const list = jsonTick.data
          .filter(it => typeof it.url_pdf === 'string' && it.url_pdf)
          .map(it => {
            const ext = (it.url_pdf.split('.').pop() || '').toLowerCase();
            const url = it.url_pdf.startsWith('http')
              ? it.url_pdf
              : `${apiHost}/${it.url_pdf}`.replace(/([^:]\/)\/+/g, '$1');
            return { ...it, url, ext };
          });
        setTickets(list);
      } else {
        setTickets([]);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [apiHost, id, trip_id]);

  useEffect(() => {
    fetchRegisters();
  }, [fetchRegisters]);

  const cancelar = () => {
    navigate(`/detalle-gastos/${trip_id}`);
  }

  if (loading) return <CargandoEditor />;

  return (
    <EditorShell
      seccion="Gastos · Viajes"
      titulo="Expense Log Editor"
      descripcion="Corrige el tipo y el monto de este gasto. Los tickets que subió el operador están a la derecha."
      onCancelar={cancelar}
      onEliminar={eliminar}
      onGuardar={actualizar}
    >
      <ResumenRegistro
        datos={[
          { etiqueta: 'Viaje', valor: formData.trip_number },
          { etiqueta: 'Operador', valor: formData.nombre },
          { etiqueta: 'Fecha', valor: formData.fecha },
          { etiqueta: 'Total', valor: dinero(formData.monto), destacado: true },
        ]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TarjetaEditor titulo="Detalles del gasto">
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  {...campo}
                  label="Expense Type"
                  value={formData.tipo_gasto}
                  onChange={(e) => handleInputChange('tipo_gasto', e.target.value)}
                  placeholder="e.g. Comida, Peaje"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...campo}
                  label="Total Cost"
                  type="number"
                  value={formData.monto}
                  onChange={(e) => handleInputChange('monto', e.target.value)}
                  InputProps={{ ...campo.InputProps, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
            </Grid>
          </TarjetaEditor>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TicketsGaleria tickets={tickets} />
        </Grid>
      </Grid>
    </EditorShell>
  );
};

export default GastoEditor;