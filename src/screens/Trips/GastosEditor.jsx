import React, { useState, useEffect } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-photo-view/dist/react-photo-view.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styles from '../../screens/css/DieselEditor.module.css';

const GastoEditor = () => {
  const navigate = useNavigate();
  const { id, trip_id } = useParams();
  const [tickets, setTickets] = useState([]);
  const apiHost = import.meta.env.VITE_API_HOST;

 const [formData, setFormData] = useState({
    id: '',
    trip_id: '',
    nombre: '',
    tipo_gasto:'',
    monto: ''
});

const handleInputChange = (name, value) => {
    setFormData( prev => ({ ...prev, [name]: value }));
  };

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

    // 2) Validación de formato numérico
    const montoNum = Number(formData.monto);

    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      Swal.fire({ icon: "warning", title: "Monto inválido", text: "Debe ser un número mayor a 0." });
      return;
    }

    // 3) Construcción del payload (faltaba enviar 'galones')
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
        Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Cambios realizados con éxito."
        });
        navigate(`/detalle-gastos/${trip_id}`);
    } else {
    throw new Error("Error al guardar datos básicos");
    }
    
  } catch (error) {
    console.error("Error al enviar los datos:", error);
    alert("Error al conectar con el servidor");
  }
};


  const eliminar = async () => {
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
      formData.append('op', 'delete_gasto');
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
          navigate(`/detalle-gastos/${trip_id}`);
        } else {
          navigate('/admin-gastos'); 
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




  const fetchRegisters = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'get_gasto');
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
        tipo_gasto: row.tipo_gasto || '',
        nombre: row.nombre || ''
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
  fd.append('opcion', 'gasto');

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

  const cancelar = () =>{
    setFormData({
      id: '',
      trip_id: '',
      tipo_gasto: '',
      monto: ''
    });

    navigate(`/detalle-gastos/${trip_id}`);
  }

  return (

   <div >

      <h1 className="titulo">Editor de registro de gasto</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="cancelar" onClick={cancelar}> Cancelar</button>
          <button className="guardar"  onClick={actualizar}>Guardar</button>
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

            <label>Tipo de gasto</label>
            <input
              type="text"
              value={formData.tipo_gasto}
              onChange={(e) => handleInputChange('tipo_gasto', e.target.value)}
            />

            <label>Monto</label>
            <input
               type="text"
               value={formData.monto}
               onChange={(e) => handleInputChange('monto', e.target.value)}
             />

            <label hidden>Trip ID</label>
            <input
              type="hidden"
              disabled
              value={formData.trip_id}
              onChange={(e) => handleInputChange('trip_id', e.target.value)}
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
                        const isImage = ['jpg','jpeg','png','webp','gif'].includes(item.ext);
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

export default GastoEditor;
