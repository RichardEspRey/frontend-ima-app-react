import React, { useState } from "react";
import './css/TripScreen.css';
import BorderCrossingForm from '../components/BorderCrossingForm'; 
import TripForm from '../components/TripForm';

const TripScreen = () => {
  const [activeForm, setActiveForm] = useState('borderCrossing'); 
  const [tripNumber, setTripNumber] = useState('');

  const handleBorderCrossingClick = () => {
    setActiveForm('borderCrossing');
  };

  const handleTripClick = () => {
    setActiveForm('trip');
  };

  const handleTripNumberChange = (event) => {
    setTripNumber(event.target.value);
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
          <button onClick={handleBorderCrossingClick}>Border Crossing</button>
          <button onClick={handleTripClick}>Trip</button>
        </div>
      </div>

      
      <div className="additional-card">
        <div className="card-container">
          {activeForm === 'borderCrossing' && <BorderCrossingForm tripNumber={tripNumber} />}
          {activeForm === 'trip' && <TripForm  tripNumber={tripNumber}/>}
        </div>

       
      </div>

    </div>
  );
};

export default TripScreen;