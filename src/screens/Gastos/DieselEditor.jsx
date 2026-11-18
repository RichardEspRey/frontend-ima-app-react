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

const cleanValue = (val) => {
    if (!val) return '';
    const strVal = String(val).trim();
    if (strVal === '0' || strVal === '0.00') return '';
    return strVal;
};

const DieselEditor = () => {
  const navigate = useNavigate();
  const { id, trip_id } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    id: '',
    trip_id: '',
    nombre: '',
    estado: '', 
    odometro: '',
    galones: '',
    monto: '',
    fleetone: '', 
    trip_number: '',
    periodo: ''
  });

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ** LÓGICA DE ACTUALIZACIÓN **
  const actualizar = async () => {
    try {
      const required = ["odometro", "galones", "monto"];
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

      const odometroNum = Number(formData.odometro);
      const galonesNum = Number(formData.galones);
      const montoNum = Number(formData.monto);

      if (!Number.isFinite(odometroNum) || odometroNum <= 0) {
        Swal.fire({ icon: "warning", title: "Odómetro inválido", text: "Debe ser un número mayor a 0." });
        return;
      }
      if (!Number.isFinite(galonesNum) || galonesNum <= 0) {
        Swal.fire({ icon: "warning", title: "Galones inválidos", text: "Debe ser un número mayor a 0." });
        return;
      }
      if (!Number.isFinite(montoNum) || montoNum <= 0) {
        Swal.fire({ icon: "warning", title: "Monto inválido", text: "Debe ser un número mayor a 0." });
        return;
      }

      // 3) Construcción del payload
      const formDataToSend = new FormData();
      formDataToSend.append("op", "edit_diesel");
      formDataToSend.append("id", formData.id);
      formDataToSend.append("trip_id", formData.trip_id);
      formDataToSend.append("nombre", formData.nombre);
      
      formDataToSend.append("estado", formData.estado);
      formDataToSend.append("fleetone", formData.fleetone);


      formDataToSend.append("odometro", String(odometroNum));
      formDataToSend.append("galones", String(galonesNum));
      formDataToSend.append("monto", String(montoNum));
      formDataToSend.append("periodo", formData.periodo);

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
        navigate(`/detalle-diesel/${trip_id}`);
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
      formData.append('op', 'delete_diesel');
      formData.append('id', id); 

      const resp = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: formData });
      const data = await resp.json();
      Swal.close();

      if (data.status === 'success') {
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Registro eliminado correctamente.', timer: 1500, showConfirmButton: false });
        navigate(trip_id ? `/detalle-diesel/${trip_id}` : '/admin-diesel');
      } else {
        throw new Error(data.message || 'No se pudo eliminar el registro');
      }
    } catch (err) {
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Ocurrió un problema al eliminar.' });
    }
  };

  // ** FETCH DATA **
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
        const fdReg = new FormData();
        fdReg.append('op', 'get_diesel');
        fdReg.append('id', id);
        fdReg.append('trip_id', trip_id);

        const respReg = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fdReg });
        const dataReg = await respReg.json();

        if (dataReg.status === 'success' && dataReg.row && dataReg.row[0]) {
            const row = dataReg.row[0];
            setFormData({
                id: row.id || '',
                trip_number: row.trip_number || '',
                trip_id: row.trip_id || '',
                monto: row.monto || '',
                fecha: row.fecha || '',
                odometro: row.odometro || '',
                galones: row.galones || '',
                nombre: row.nombre || '',
                
                estado: cleanValue(row.estado),
                fleetone: cleanValue(row.fleetone),
                periodo: row.periodo || ''
            });
        }
        
        // 2. Fetch Tickets
        const fdTick = new FormData();
        fdTick.append('op', 'getTickets');
        fdTick.append('id', id);
        fdTick.append('trip_id', trip_id);
        fdTick.append('opcion', 'diesel');

        const respTick = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fdTick });
        const jsonTick = await respTick.json();

        if (jsonTick.status === 'success' && Array.isArray(jsonTick.data)) {
            const list = jsonTick.data
              .filter(it => typeof it.url_pdf === 'string' && it.url_pdf)
              .map(it => {
                const ext = (it.url_pdf.split('.').pop() || '').toLowerCase();
                
                const cleanPath = it.url_pdf.replace(/^\.\.\//, ''); 
                const url = `${apiHost}/${cleanPath}`;
                  
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

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const cancelar = () => { navigate(`/detalle-diesel/${trip_id}`); }

  if (loading) return <CargandoEditor />;

  return (
    <EditorShell
      seccion="Gastos · Diesel"
      titulo="Diesel Log Editor"
      descripcion="Corrige los datos de esta carga. Los tickets que subió el operador están a la derecha."
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
          <TarjetaEditor titulo="Detalles de la carga">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...campo}
                  label="State"
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  placeholder="e.g. TX, NM"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...campo}
                  label="Fleet One ($)"
                  type="number"
                  value={formData.fleetone}
                  onChange={(e) => handleInputChange('fleetone', e.target.value)}
                  placeholder="0.00"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...campo}
                  label="Odometer"
                  type="number"
                  value={formData.odometro}
                  onChange={(e) => handleInputChange('odometro', e.target.value)}
                  InputProps={{ ...campo.InputProps, endAdornment: <InputAdornment position="end">mi</InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...campo}
                  label="Gallons"
                  type="number"
                  value={formData.galones}
                  onChange={(e) => handleInputChange('galones', e.target.value)}
                  InputProps={{ ...campo.InputProps, endAdornment: <InputAdornment position="end">gal</InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...campo}
                  label="Total Cost"
                  type="number"
                  value={formData.monto}
                  onChange={(e) => handleInputChange('monto', e.target.value)}
                  InputProps={{ ...campo.InputProps, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...campo}
                  label="Periodo"
                  value={formData.periodo}
                  onChange={(e) => handleInputChange('periodo', e.target.value)}
                  placeholder="Ej. Q1, Q2..."
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

export default DieselEditor;