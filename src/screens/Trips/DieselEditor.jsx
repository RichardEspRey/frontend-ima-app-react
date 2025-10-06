import React, { useState, useEffect } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-photo-view/dist/react-photo-view.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styles from '../../screens/css/DieselEditor.module.css';

const DieselEditor = () => {
  const navigate = useNavigate();
  const { id, trip_id } = useParams();
  const [tickets, setTickets] = useState([]);
  const apiHost = import.meta.env.VITE_API_HOST;

  const [formData, setFormData] = useState({
    id: '',
    trip_id: '',
    nombre: '',
    estado: '',
    odometro: '',
    galones: '',
    monto: '',
    fleetone: ''
  });

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const actualizar = async () => {
    try {
      // 1) Validación de obligatorios (no vacíos / no espacios)
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

      // 2) Validación de formato numérico
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

      // 3) Construcción del payload (faltaba enviar 'galones')
      const formDataToSend = new FormData();
      formDataToSend.append("op", "edit_diesel");
      formDataToSend.append("id", formData.id);
      formDataToSend.append("trip_id", formData.trip_id);
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("estado", formData.estado);
      formDataToSend.append("odometro", String(odometroNum));
      formDataToSend.append("galones", String(galonesNum));
      formDataToSend.append("monto", String(montoNum));
      formDataToSend.append("fleetone", String(formData.fleetone));

      const response = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: formDataToSend,
      });
      const result = await response.json();

      if (result.status === "success" && result.row?.[0]?.resp == 1) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Cambios realizados con éxito."
        });
        navigate(`/detalle-diesel/${trip_id}`);
      } else {
        throw new Error("Error al guardar datos básicos");
      }

    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Error al conectar con el servidor");
    }
  };

  const fetchRegisters = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'get_diesel');
    formDataToSend.append('id', id);
    formDataToSend.append('trip_id', trip_id);

    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.status === 'success') {
        const row = data.row[0];
        const formValues = {
          id: row.id || '',
          trip_number: row.trip_number || '',
          trip_id: row.trip_id || '',
          monto: row.monto || '',
          fecha: row.fecha || '',
          odometro: row.odometro || '',
          galones: row.galones || '',
          nombre: row.nombre || '',
          estado: row.estado || '',
          fleetone: row.fleetone || ''
        };

        setFormData(formValues);


      }

    } catch (error) {
      console.error('Error al obtener los conductores:', error);
    }
  };

  const fetchTickets = async () => {
    const fd = new FormData();
    fd.append('op', 'getTickets');
    fd.append('id', id);
    fd.append('trip_id', trip_id);
    fd.append('opcion', 'diesel');
    try {
      const resp = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fd });
      const json = await resp.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        const list = json.data
          .filter(it => typeof it.url_pdf === 'string' && it.url_pdf) // válidos
          .map(it => {
            const ext = (it.url_pdf.split('.').pop() || '').toLowerCase();
            // Une base + ruta evitando dobles slashes
            const url = it.url_pdf.startsWith('http')
              ? it.url_pdf
              : `${apiHost}/${it.url_pdf}`.replace(/([^:]\/)\/+/g, '$1');
            return { ...it, url, ext };
          });
        setTickets(list);
      } else {
        setTickets([]);
      }
    } catch (e) {
      console.error('Error fetchTickets:', e);
      setTickets([]);
    }
  };


  useEffect(() => {

    fetchRegisters();
    fetchTickets();
  }, []);

  const cancelar = () => {
    setFormData({
      id: '',
      trip_number: '',
      trip_id: '',
      nombre: '',
      estado: '',
      odometro: '',
      galones: '',
      monto: '',
      fleetone: ''
    });

    navigate(`/detalle-diesel/${trip_id}`);
  }

  const eliminar = async () => {
    // 1) Confirmación
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Perderás el registro',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Eliminando…',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      formData.append('op', 'delete_diesel');
      formData.append('id', id); 

      const resp = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();
      Swal.close();

      if (data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Registro eliminado',
        });

     
        if (trip_id) {
          navigate(`/detalle-diesel/${trip_id}`);
        } else {
          navigate('/admin-diesel'); // fallback
        }
      } else {
        throw new Error(data.message || 'No se pudo eliminar el registro');
      }
    } catch (err) {
      Swal.close();
      console.error('Error al eliminar:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Ocurrió un problema al eliminar.',
      });
    }
  };



  return (

    <div >

      <h1 className="titulo">Editor de registro diesel</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="cancelar" onClick={cancelar}> Cancelar</button>
          <button className="guardar" onClick={actualizar}>Guardar</button>
          <button className="eliminar" onClick={eliminar}>Eliminar</button>
        </div>

        <div className={styles.formColumns}>
          <div className={styles.column}>


            <label>Trip Number</label>
            <input
              type="text"
              disabled
              value={formData.trip_number}
              onChange={(e) => handleInputChange('trip_number_id', e.target.value)}
            />

            <label>Driver</label>
            <input
              type="text"
              disabled
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
            />
            <label>Estado</label>
            <input
              type="text"
              value={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
            />

            <label>Odometro</label>
            <input
              type="text"
              value={formData.odometro}
              onChange={(e) => handleInputChange('odometro', e.target.value)}
            />


            <label>Galones</label>
            <input
              type="text"
              value={formData.galones}
              onChange={(e) => handleInputChange('galones', e.target.value)}
            />

            <label>Monto</label>
            <input
              type="text"
              value={formData.monto}
              onChange={(e) => handleInputChange('monto', e.target.value)}
            />

            <label>Fleetone</label>
            <input
              type="text"
              value={formData.fleetone}
              onChange={(e) => handleInputChange('fleetone', e.target.value)}
            />

            <label htmlFor="trip_id" hidden>Trip ID</label>
            <input
              type="hidden"
              id="trip_id"
              name="trip_id"
              value={formData.trip_id}
            />

            <label hidden>No de registro</label>
            <input
              type="hidden"
              disabled
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
            />


          </div>



          <div className={styles.formColumns}>
            <div className={styles.column}>
              <h3>Tickets</h3>

              <PhotoProvider>
                <div className={styles.thumbGrid} >
                  {tickets.length === 0 ? (
                    <p>Sin imágenes.</p>
                  ) : (
                    tickets.map(item => {
                      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(item.ext);
                      if (!isImage) {
                        // Si no es imagen (e.g. PDF), muestra un link
                        return (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.thumbFile}
                            title={`Abrir archivo ${item.ext.toUpperCase()}`}
                          >
                            Ver archivo
                          </a>
                        );
                      }
                      return (
                        <PhotoView key={item.id} src={item.url}>
                          <img
                            className={styles.thumb}
                            src={item.url}
                            alt={`ticket ${item.id}`}
                            loading="lazy"
                          />
                        </PhotoView>
                      );
                    })
                  )}
                </div>
              </PhotoProvider>
            </div>
          </div>



        </div>

      </div>
    </div>
  );

};

export default DieselEditor;
