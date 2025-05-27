import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/ModalArchivo.css';
import Swal from 'sweetalert2';

const ModalArchivoEditor = ({ isOpen, onClose, onSave, nombreCampo, valorActual, endpoint,tipo, mostrarFechaVencimiento = true }) => {

  const [archivo, setArchivo] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null); 

useEffect(() => {
  if (isOpen) {
    setArchivo(null);

    if (valorActual?.url) {
      setPreviewUrl(valorActual.url); // ✅ si ya hay un documento, se precarga
    } else {
      setPreviewUrl(null); // solo limpiar si no hay nada
    }

    setFechaVencimiento(
      valorActual?.vencimiento ? new Date(valorActual.vencimiento) : new Date()
    );
  }
}, [isOpen, valorActual]);



  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setArchivo(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Por favor selecciona un archivo PDF válido.');
    }
  };

 const apiHost = import.meta.env.VITE_API_HOST;
const handleGuardar = () => {
  if (!archivo) {
    Swal.fire({
      icon: 'warning',
      title: 'No se puede guardar',
      text: 'Debes seleccionar un archivo PDF diferente para actualizar.',
    });
    return;
  }

  Swal.fire({
    title: "¿Estás seguro de actualizar el documento?",
    showDenyButton: true,
    confirmButtonText: "Guardar",
    denyButtonText: `No guardar`
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const formData = new FormData();
        formData.append('op', 'Alta');
        formData.append(tipo, valorActual?.id);
        formData.append('tipo_documento', valorActual?.tipo);
        formData.append('fecha_vencimiento', fechaVencimiento.toISOString().split('T')[0]);
        formData.append('documento', archivo);

        const response = await fetch(`${apiHost}/${endpoint}`, { 
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'El documento fue actualizado correctamente',
          });
          onClose();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el documento',
          });
        }
      } catch (error) {
        console.error('Error al enviar el documento:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de red',
          text: 'Hubo un problema al conectarse con el servidor',
        });
      }
    } else if (result.isDenied) {
      Swal.fire("Documento no guardado", "", "info");
    }
  });
};




  const handleBrowseClick = () => {
    fileInputRef.current.click(); // Activamos el input file al hacer clic en el botón
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          
          <button onClick={onClose} className="close-button">&times;</button>
        </div>


        {mostrarFechaVencimiento && (
          <div>
            <h4>Fecha de vencimiento</h4>
            <DatePicker
              selected={fechaVencimiento}
              onChange={(date) => setFechaVencimiento(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Ejemplo: 2025-12-31"
              className="custom-datepicker"
            />
          </div>
        )}

        <div className="dropzone">
          <label className="drop-text">
            <div>Deje aquí sus archivos PDF's para cargarlos</div>
          </label>
          <button type='button' className="browse-button" onClick={handleBrowseClick}>Browse file</button> 
          <input
            type="file"
            ref={fileInputRef} 
            onChange={handleArchivoChange}
            style={{ display: 'none' }}
            accept="application/pdf"
          />

          {previewUrl && (
            <div className="archivo-preview">
              <strong>Vista previa:</strong>
              <iframe src={previewUrl} title="Vista previa PDF" width="100%" height="400px" />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancelar">Cancelar</button>
          <button onClick={handleGuardar} className="guardar">Actualizar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalArchivoEditor;