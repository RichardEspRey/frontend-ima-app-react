import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/ModalArchivo.css';

const ModalArchivo = ({ isOpen, onClose, onSave, nombreCampo, valorActual, mostrarFechaVencimiento = true }) => {
  const [archivo, setArchivo] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null); 

  useEffect(() => {
    
    if (isOpen) {
      setArchivo(null);
      setPreviewUrl(null);
      setFechaVencimiento(valorActual?.vencimiento ? new Date(valorActual.vencimiento) : new Date());
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

  const handleGuardar = () => {
    if (archivo) {
      const dataToSave = {
        file: archivo,
        fileName: archivo.name,
      };
      if (mostrarFechaVencimiento && fechaVencimiento) {
        dataToSave.vencimiento = fechaVencimiento.toISOString().split('T')[0];
      } else if (mostrarFechaVencimiento && !fechaVencimiento) {
        alert('Por favor, selecciona una fecha de vencimiento.');
        return;
      }
      onSave(dataToSave);
      onClose();
    } else {
      alert('Selecciona un archivo y una fecha');
    }
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
            <div>Deje aquí sus archivos para cargarlos</div>
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

export default ModalArchivo;