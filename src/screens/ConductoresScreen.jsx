import React, { useState } from 'react';
import './css/ConductoresScreen.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ConductoresScreen = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    actaNacimiento: '',
    actaNacimientoDate: null,
    curp: '',
    // ... otros campos
  });

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFieldName, setSelectedFieldName] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      [`${selectedFieldName}Date`]: date.toISOString().split("T")[0],
    }));
  };

  const handleFileChange = (e, name) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      [name]: file.name,
      [`${name}File`]: file
    }));
  };

  const openModal = (field) => {
    setSelectedFieldName(field);
    setSelectedDate(new Date());
    setModalVisible(true);
  };

  const handleSubmit = () => {
    console.log("Guardando...", formData);
  };

  return (
    
    <div >
      
      <h1 className="titulo">Alta de Conductor</h1>
      <div className="conductores-container">
      <div className="btnConteiner">
        <button className="btn cancelar">Cancelar</button>
        <button className="btn guardar" onClick={handleSubmit}>Guardar</button>
      </div>
      
      <div className="form-columns">
          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
        <div className="column">
          <label>Nombre de conductor</label>
          <input
            type="text"
            placeholder="Nombre y apellidos"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
          />

          <label>Fecha de nacimiento</label>
          <input
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
          />

          <label>Acta de nacimiento (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>Curp (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>Comprobante de domicilio (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>Solicitud de empleo (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />
        </div>

       {/* Puedes continuar con las otras dos columnas como en tu versión original */}
        <div className="column">
          <label>INE</label>
          <input
            type="text"
            placeholder="Nombre y apellidos"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
          />

          <label>No de visa</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>RFC (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>No. Licencia (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>Vencimiento de 1-94 (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>APTO (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />
        </div>


      {/* Puedes continuar con las otras dos columnas como en tu versión original */}
        <div className="column">
          <label>Atidoping</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

          <label>Numero celular USA</label>
          <input
            type="text"
            placeholder="Nombre y apellidos"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
          />

          <label>Numero celular MEX (PDF)</label>
          <input
            type="text"
            placeholder="Nombre y apellidos"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
          />

          <label>Constancia de situacion fiscal (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'actaNacimiento')}
          />

        </div>

      
      </div>

   
      </div>
    </div>
  );
};

export default ConductoresScreen;
