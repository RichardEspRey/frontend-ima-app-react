import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/ModalArchivo.css';

const InfoGeneral = ({ isOpen, onClose, onSave, nombreCampo, valorActual }) => {
  const [archivo, setArchivo] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (valorActual) {
      setFechaVencimiento(valorActual.vencimiento ? new Date(valorActual.vencimiento) : new Date());
      setArchivo(valorActual.file || null);
    }
  }, [valorActual]);

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
    if (archivo && fechaVencimiento) {
      onSave({
        file: archivo,
        fileName: archivo.name,
        vencimiento: fechaVencimiento.toISOString().split('T')[0]
      });
      onClose();
    } else {
      alert('Selecciona un archivo y una fecha');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Fecha de vencimiento</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <DatePicker
          selected={fechaVencimiento}
          onChange={(date) => setFechaVencimiento(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Ejemplo: 2025-12-31"
          className="custom-datepicker"
        />

        <div className="dropzone">
          <label className="drop-text">
          <div>Deje aquí sus archivos para cargarlos</div>
          
            <input type="file" onChange={handleArchivoChange} style={{ display: 'none' }} accept="application/pdf" />
            <button className="browse-button">Browse file</button>
          </label>

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

export default InfoGeneral;
