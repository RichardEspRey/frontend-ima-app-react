import React, { useState } from 'react';
import './css/BorderCrossingForm.css';

const BorderCrossingForm = () => {
  const [formData, setFormData] = useState({
    Driver: '',
    truck: '',
    trailer: '',
    company: '',
    ci_number: '',
    ima_invoice: '',
    warehouse_origin: '',
    warehouse_destination: '',
    origin: '',
    Destination: '',
    zip_code_origin: '',
    zip_code_destination: '',
    loading_date: '',
    delivery_date: '',
    carta_porte: '',
    ci: '',
    entry: '',
    manifiesto: '',
    cita_entrega: '',
    bl: '',
    order_retiro: '',
    bl_firmado: '',
    rate_tarifa: '',
    millas_pc_miller: '',
  });

  const setForm = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(name, value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Datos del Border Crossing:', formData);
    // enviar los datos del formulario 
  };

  return (
    <form onSubmit={handleSubmit} className="card-container">
      <span className="card-label">Información del Viaje</span>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="Driver">Driver:</label>
          <input
            type="text"
            id="Driver"
            name="Driver"
            value={formData.Driver}
            onChange={handleChange}
            placeholder="Driver"
          />
        </div>
        <div className="column">
          <label htmlFor="truck">Truck:</label>
          <input
            type="text"
            id="truck"
            name="truck"
            value={formData.truck}
            onChange={handleChange}
            placeholder="Truck"
          />
        </div>
        <div className="column">
          <label htmlFor="trailer">Trailer:</label>
          <input
            type="text"
            id="trailer"
            name="trailer"
            value={formData.trailer}
            onChange={handleChange}
            placeholder="Trailer"
          />
        </div>
        <div className="column">
          <label htmlFor="company">Company:</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company"
          />
        </div>
      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="ci_number">CI Numner:</label>
          <input
            type="text"
            id="ci_number"
            name="ci_number"
            value={formData.ci_number}
            onChange={handleChange}
            placeholder="CI Number"
          />
        </div>
        <div className="column">
          <label htmlFor="ima_invoice">IMA Invoice:</label>
          <input
            type="text"
            id="ima_invoice"
            name="ima_invoice"
            value={formData.ima_invoice}
            onChange={handleChange}
            placeholder="IMA Invoice"
          />
        </div>
      </div>

      <span className="card-label">Origin / Destination </span>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="warehouse_origin">Warehouse:</label>
          <input
            type="text"
            id="warehouse_origin"
            name="warehouse_origin"
            value={formData.warehouse_origin}
            onChange={handleChange}
            placeholder="Warehouse"
          />
        </div>
        <div className="column">
          <label htmlFor="warehouse_destination">Warehouse:</label>
          <input
            type="text"
            id="warehouse_destination"
            name="warehouse_destination"
            value={formData.warehouse_destination}
            onChange={handleChange}
            placeholder="Warehouse"
          />
        </div>
      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="origin">Origin:</label>
          <input
            type="text"
            id="origin"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            placeholder="Origin"
          />
        </div>
        <div className="column">
          <label htmlFor="Destination">Destination:</label>
          <input
            type="text"
            id="Destination"
            name="Destination"
            value={formData.Destination}
            onChange={handleChange}
            placeholder="Destination"
          />
        </div>
      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="zip_code_origin">Zip Code Origin:</label>
          <input
            type="text"
            id="zip_code_origin"
            name="zip_code_origin"
            value={formData.zip_code_origin}
            onChange={handleChange}
            placeholder="Zip Code"
          />
        </div>
        <div className="column">
          <label htmlFor="zip_code_destination">Zip Code Destination:</label>
          <input
            type="text"
            id="zip_code_destination"
            name="zip_code_destination"
            value={formData.zip_code_destination}
            onChange={handleChange}
            placeholder="Zip Code"
          />
        </div>
      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="loading_date">Loading Date:</label>
          <input
            type="text"
            id="loading_date"
            name="loading_date"
            value={formData.loading_date}
            onChange={handleChange}
            placeholder="Loading Date"
          />
        </div>
        <div className="column">
          <label htmlFor="delivery_date">Delivery Date:</label>
          <input
            type="text"
            id="delivery_date"
            name="delivery_date"
            value={formData.delivery_date}
            onChange={handleChange}
            placeholder="Delivery Date"
          />
        </div>
      </div>

      <span className="card-label">Docuementos del Viaje</span>
      <div className="input-columns">
        <div className="column">
          <label htmlFor="carta_porte">Carta Porte:</label>
          <input
            type="text"
            id="carta_porte"
            name="carta_porte"
            value={formData.carta_porte}
            onChange={handleChange}
            placeholder="Carta Porte"
          />
        </div>
        <div className="column">
          <label htmlFor="CI">CI:</label>
          <input
            type="text"
            id="ci"
            name="ci"
            value={formData.ci}
            onChange={handleChange}
            placeholder="CI"
          />
        </div>
      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="entry">Entry:</label>
          <input
            type="text"
            id="entry"
            name="entry"
            value={formData.entry}
            onChange={handleChange}
            placeholder="Entry"
          />
        </div>
        <div className="column">
          <label htmlFor="manifiesto">Manifiesto:</label>
          <input
            type="text"
            id="manifiesto"
            name="manifiesto"
            value={formData.manifiesto}
            onChange={handleChange}
            placeholder="Manifiesto"
          />
        </div>
      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="cita_entrega">Cita Entrega:</label>
          <input
            type="text"
            id="cita_entrega"
            name="cita_entrega"
            value={formData.cita_entrega}
            onChange={handleChange}
            placeholder="Cita entrega"
          />
        </div>
        <div className="column">
          <label htmlFor="bl">BL:</label>
          <input
            type="text"
            id="bl"
            name="bl"
            value={formData.bl}
            onChange={handleChange}
            placeholder="BL"
          />
        </div>
        <div className="column">
          <label htmlFor="order_retiro">Orden de Retiro:</label>
          <input
            type="text"
            id="order_retiro"
            name="order_retiro"
            value={formData.order_retiro}
            onChange={handleChange}
            placeholder="Orden de Retiro"
          />
        </div>
      </div>

      <span className="card-label">Informacion de finalizacion de viaje</span>
      <div className="input-columns">
        <div className="column">
          <label htmlFor="bl_firmado">BL Firmado:</label>
          <input
            type="text"
            id="bl_firmado"
            name="bl_firmado"
            value={formData.bl_firmado}
            onChange={handleChange}
            placeholder="BL Firmado"
          />
        </div>
        <div className="column">
          <label htmlFor="rate_tarifa">Rate Tarifa:</label>
          <input
            type="text"
            id="rate_tarifa"
            name="rate_tarifa"
            value={formData.rate_tarifa}
            onChange={handleChange}
            placeholder="Rate Tarifa"
          />
          <label htmlFor="millas_pc_miller">Millas PCMiller:</label>
          <input
            type="text"
            id="millas_pc_miller"
            name="millas_pc_miller"
            value={formData.millas_pc_miller}
            onChange={handleChange}
            placeholder="Millas PCMiller"
          />
        </div>
      </div>
      {/* <button type="submit">Guardar Border Crossing</button> */}
    </form>
  );
};

export default BorderCrossingForm;