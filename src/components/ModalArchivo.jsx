import React, { useState, useEffect, useRef } from 'react';
import { archivoDelEvento, GRUPOS_ARCHIVO } from '../shared/security';
import { CampoFecha, aTextoFecha } from '../shared/ui';
import './css/ModalArchivo.css';

const ModalArchivo = ({ isOpen, onClose, onSave, title = "Subir/Editar Archivo", valorActual, mostrarFechaVencimiento = true, accept = "application/pdf" }) => {

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

  const grupoDelAccept = () => {
    if (accept.includes('pdf') && !accept.includes('image')) return GRUPOS_ARCHIVO.SOLO_PDF;
    if (accept.includes('image') && !accept.includes('pdf')) return GRUPOS_ARCHIVO.IMAGEN;
    return GRUPOS_ARCHIVO.DOCUMENTO;
  };

  const handleArchivoChange = async (e) => {
    const file = await archivoDelEvento(e, { grupo: grupoDelAccept() });
    if (!file) return;

    setArchivo(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGuardar = () => {
    if (archivo) {
      const dataToSave = {
        file: archivo,
        fileName: archivo.name,
        hasNewFile: true,
      };
      if (mostrarFechaVencimiento && fechaVencimiento) {
        dataToSave.vencimiento = aTextoFecha(fechaVencimiento);
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
    fileInputRef.current.click();
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
            <CampoFecha
              value={fechaVencimiento}
              onChange={(date) => setFechaVencimiento(date)}
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