import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isValid, parseISO } from 'date-fns';
import './css/ModalArchivo.css';
import { esImagen } from '../utils/tripFormConstants';

const fechaInicial = (valor) => {
  if (!valor) return new Date();
  const fecha = valor instanceof Date ? valor : parseISO(String(valor));
  return isValid(fecha) ? fecha : new Date();
};

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

      setFechaVencimiento(fechaInicial(valorActual?.vencimiento));
    }
  }, [isOpen, valorActual]);



  const seleccionarArchivo = (file) => {
    if (!file) return;

    const allowedTypes = accept.split(',').map(type => type.trim().toLowerCase());

    const isAllowed = allowedTypes.some(type => {
      if (type === '*/*') return true;
      if (type.endsWith('/*')) return file.type.startsWith(type.slice(0, -1));
      if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type);
      return type === file.type;
    });

    if (isAllowed) {
      setArchivo(file);
      setAviso('');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setAviso(`Tipo de archivo no válido. Se esperaba: ${accept}`);
    }
  };

  const handleArchivoChange = (e) => {
    seleccionarArchivo(e.target.files[0]);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setArrastrando(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    seleccionarArchivo(e.dataTransfer.files[0]);
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
      dataToSave.vencimiento = format(fechaVencimiento, 'yyyy-MM-dd');
    }
    onSave(dataToSave);
    onClose();
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click(); // Activamos el input file al hacer clic en el botón
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
            <DatePicker
              selected={fechaVencimiento}
              onChange={(date) => setFechaVencimiento(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Ejemplo: 2025-12-31"
              className="custom-datepicker"
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