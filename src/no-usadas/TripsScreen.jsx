import React, { useState } from "react";
import './css/TripScreen.css';
import BorderCrossingForm from '../components/BorderCrossingForm';
import TripForm from '../components/TripForm';

const TripScreen = () => {
  const [activeForm, setActiveForm] = useState('borderCrossing');
  const [tripNumber, setTripNumber] = useState('');
  
  // 1. Añade el estado para la key
  const [formKey, setFormKey] = useState(1);

  const handleBorderCrossingClick = () => {
    setActiveForm('borderCrossing');
  };

  const handleTripClick = () => {
    setActiveForm('trip');
  };

  const handleTripNumberChange = (event) => {
    setTripNumber(event.target.value);
  };

  // 2. Crea la función que el hijo llamará al tener éxito
  const handleFormSuccess = () => {
    console.log("El formulario hijo guardó con éxito. Reiniciando desde el padre.");
    
    // Limpia el campo de tripNumber en este componente (el padre)
    setTripNumber('');
    
    // Cambia la key. Esto fuerza a React a desmontar y volver a montar el
    // componente BorderCrossingForm, reseteando todo su estado interno.
    setFormKey(prevKey => prevKey + 1);
  };

  return (
    <div className="trip-screen-container">
      <div className="trip-screen-wrapper">
        <div className="trip-card">
          <div className="trip-container">
            <span className="trip-label">Trip Number</span>
            <input
              className="trip-input"
              placeholder="Enter trip number: 2025-01"
              value={tripNumber}
              id='trip_number'
              onChange={handleTripNumberChange}
            />
          </div>
        </div>

        <div className="button-container">
          {/* ... tus botones ... */}
          <button
            onClick={handleBorderCrossingClick}
            className={activeForm === 'borderCrossing' ? 'selected' : ''}
          >
            Border Crossing
          </button>
          <button
            onClick={handleTripClick}
            className={activeForm === 'trip' ? 'selected' : ''}
          >
            Trip
          </button>
        </div>
      </div>

      <div className="additional-card">
        <div className="card-container">
          {/* 3. Pasa las nuevas props al componente hijo */}
          {activeForm === 'borderCrossing' && (
            <BorderCrossingForm
              key={formKey}
              tripNumber={tripNumber}
              onSuccess={handleFormSuccess}
            />
          )}
          {/* Opcional: También puedes aplicar la misma lógica a TripForm si es necesario */}
          {activeForm === 'trip' && (
            <TripForm
              key={formKey + 1000} // Usa una key diferente si quieres que también se resetee
              tripNumber={tripNumber}
              onSuccess={handleFormSuccess} // Reutiliza la misma función
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TripScreen;