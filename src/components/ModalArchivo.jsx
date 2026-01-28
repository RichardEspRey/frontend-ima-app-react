import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/ModalArchivo.css';

const ModalArchivo = ({ isOpen, onClose, onSave, title = "Subir/Editar Archivo",     
  saveButtonText = "Guardar", valorActual, mostrarFechaVencimiento = true, accept = "application/pdf" }) => {

  const [archivo, setArchivo] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setArchivo(null);

      if (valorActual?.url) {
        setPreviewUrl(valorActual.url);
      } else {
        setPreviewUrl(null);
      }

      setFechaVencimiento(
        valorActual?.vencimiento ? new Date(valorActual.vencimiento) : new Date()
      );
    }
  }, [isOpen, valorActual]);



  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = accept.split(',').map(type => type.trim());

    if (allowedTypes.includes(file.type) || allowedTypes[0] === '*/*') {
      setArchivo(file);
      // Limpia la previsualización anterior para evitar fugas de memoria
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert(`Tipo de archivo no válido. Se esperaba: ${accept}`);
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
          <h4>{title}</h4>
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

          <button type='button' className="browse-button" onClick={handleBrowseClick}>
            Seleccionar Archivo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleArchivoChange}
            style={{ display: 'none' }}
            accept={accept}
          />

          {previewUrl && (
            <div className="archivo-preview">
              <strong>Vista previa:</strong>
              {/* Lógica para mostrar imagen o iframe */}
              {previewUrl.startsWith('blob:') && archivo?.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%' }} />
              ) : (
                <iframe src={previewUrl} title="Vista previa" width="100%" height="400px" />
              )}
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