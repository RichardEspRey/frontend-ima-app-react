import React, { useState, useEffect, useRef } from 'react';
import { archivoDelEvento, validarArchivo, GRUPOS_ARCHIVO } from '../shared/security';
import { CampoFecha, aTextoFecha, aFecha } from '../shared/ui';
import './css/ModalArchivo.css';
import { esImagen } from '../utils/tripFormConstants';

const ModalArchivo = ({ isOpen, onClose, onSave, title = "Subir/Editar Archivo", valorActual, mostrarFechaVencimiento = true, accept = "application/pdf" }) => {

  const [archivo, setArchivo] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [previewUrl, setPreviewUrl] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [aviso, setAviso] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setArchivo(null);
      setAviso('');
      setArrastrando(false);

      if (valorActual?.url) {
        setPreviewUrl(valorActual.url);
      } else {
        setPreviewUrl(null);
      }

      setFechaVencimiento(aFecha(aTextoFecha(valorActual?.vencimiento)) ?? new Date());
    }
  }, [isOpen, valorActual]);

  const grupoDelAccept = () => {
    if (accept.includes('pdf') && !accept.includes('image')) return GRUPOS_ARCHIVO.SOLO_PDF;
    if (accept.includes('image') && !accept.includes('pdf')) return GRUPOS_ARCHIVO.IMAGEN;
    return GRUPOS_ARCHIVO.DOCUMENTO;
  };

  const usarArchivo = (file) => {
    setArchivo(file);
    setAviso('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleArchivoChange = async (e) => {
    const file = await archivoDelEvento(e, { grupo: grupoDelAccept() });
    if (file) usarArchivo(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setArrastrando(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const resultado = await validarArchivo(file, { grupo: grupoDelAccept() });
    if (resultado.valido) usarArchivo(file);
    else setAviso(`${file.name}: ${resultado.motivo}`);
  };

  const handleGuardar = () => {
    if (!archivo) {
      setAviso(valorActual?.fileName
        ? 'Para reemplazar el documento, selecciona o arrastra el archivo nuevo.'
        : 'Selecciona o arrastra el archivo que quieres subir.');
      return;
    }
    if (mostrarFechaVencimiento && !fechaVencimiento) {
      setAviso('Selecciona la fecha de vencimiento.');
      return;
    }
    const dataToSave = {
      file: archivo,
      fileName: archivo.name,
      hasNewFile: true,
    };
    if (mostrarFechaVencimiento) {
      dataToSave.vencimiento = aTextoFecha(fechaVencimiento);
    }
    onSave(dataToSave);
    onClose();
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  const mostrarComoImagen = archivo
    ? archivo.type.startsWith('image/')
    : esImagen(valorActual?.fileName || previewUrl);

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

        <div
          className={`dropzone${arrastrando ? ' dropzone-activa' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="drop-text">
            <div>Arrastra aquí el archivo o selecciónalo</div>
          </label>

          <button type='button' className="browse-button" onClick={handleBrowseClick}>
            {valorActual?.fileName ? 'Seleccionar archivo nuevo' : 'Seleccionar Archivo'}
          </button>

          <div className="archivo-nombre">
            {archivo
              ? <>Archivo nuevo: <strong>{archivo.name}</strong></>
              : valorActual?.fileName && <>Archivo actual: <strong>{valorActual.fileName}</strong></>}
          </div>
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
              {mostrarComoImagen ? (
                <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%' }} />
              ) : (
                <iframe src={previewUrl} title="Vista previa" width="100%" height="400px" />
              )}
            </div>
          )}
        </div>

        {aviso && <div className="modal-aviso">{aviso}</div>}

        <div className="modal-actions">
          <button onClick={onClose} className="cancelar">Cancelar</button>
          <button onClick={handleGuardar} className="guardar">{valorActual?.fileName ? 'Reemplazar' : 'Subir'}</button>
        </div>
      </div>
    </div>
  );
};

export default ModalArchivo;