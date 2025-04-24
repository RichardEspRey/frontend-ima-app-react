import React, { useState } from 'react';
// import Select from 'react-select';
import './css/TripForm.css';
import ModalArchivo from './ModalArchivo';
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';


const TripForm = ({ tripNumber }) => {
  const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
  const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
  const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
  const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
  const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

  const [documentos, setDocumentos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);

  const [formData, setFormData] = useState({
    trip_number: tripNumber,
    driver_id: '',
    truck_id: '',
    caja_id: '',
    company: '',
    ci_number: '',
    travel_direction: '',
    ima_invoice: '',
    warehouse_origin: '',
    warehouse_destination: '',
    origin: '',
    Destination: '',
    zip_code_origin: '',
    zip_code_destination: '',
    loading_date: '',
    delivery_date: '',
    ci: '',
    cita_entrega: '',
    bl: '',
    order_retiro: '',
    bl_firmado: '',
    rate_tarifa: '',
    millas_pc_miller: '',
    // carta_porte: '',
    // entry: '',
    // manifiesto: '',
  });

  useEffect(() => {
    setFormData(prevFormData => ({
        ...prevFormData,
        trip_number: tripNumber,
    }));
}, [tripNumber]);

  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({
      ...prev,
      [campo]: data
    }));
  };

  const abrirModal = (campo) => {
    setCampoActual(campo);
    setModalAbierto(true);
  };

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
    console.log('Datos del Viaje:', formData);
    // Aquí puedes enviar los datos del formulario
  };



  return (
    <form onSubmit={handleSubmit} className="card-container">
      <div className="form-actions">
        <button type="button" className="cancel-button" onClick={() => {
          console.log('Cancelar clickeado');
        }}>Cancelar</button>
        <button type="submit" className="accept-button">Guardar</button>
      </div>
      <span className="card-label">Información del Viaje</span>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="Driver">Driver:</label>
          <select
            id="driver_id"
            name="driver_id"
            value={formData.driver_id}
            onChange={handleChange}>
            <option value="">Seleccionar Conductor</option>
            {activeDrivers.map(driver => (
              <option key={driver.driver_id} value={driver.driver_id}>{driver.nombre}</option>
            ))}
          </select>

        </div>
        <div className="column">
          <label htmlFor="truck">Truck:</label>
          <select
            id="truck_id"
            name="truck_id"
            value={formData.truck_id}
            onChange={handleChange}
          >
            <option value="">Seleccionar Truck</option>
            {activeTrucks.map(truck => (
              <option key={truck.truck_id} value={truck.truck_id}>{truck.unidad}</option>
            ))}
          </select>

        </div>
        <div className="column">
          <label htmlFor="trailer">Trailer:</label>
          <select
            id="caja_id"
            name="caja_id"
            value={formData.caja_id}
            onChange={handleChange}
          >
            <option value="">Seleccionar Trailer</option>
            {activeTrailers.map(caja => (
              <option key={caja.caja_id} value={caja.caja_id}>{caja.no_caja}</option>
            ))}
          </select>

        </div>
        <div className="column">
          <label htmlFor="company">Company:</label>
          <select
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          >
            <option value="">Seleccionar Company</option>
            {activeCompanies.map(company => (
              <option key={company.company_id} value={company.company_id}>{company.nombre_compania}</option>
            ))}
          </select>
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
          <button type="button" onClick={() => abrirModal('ima_invoice')}>Subir documento</button>
          {documentos.ima_invoice && (
            <p>{documentos.ima_invoice.fileName} - {documentos.ima_invoice.vencimiento}</p>
          )}

        </div>

        <div className="column">
          <label htmlFor="Driver">Travel Directiom:</label>
          <select
            value={formData.travel_direction}
            onChange={handleChange}
            name='travel_direction'
          >
            <option value="">Travel Direction</option>
            <option value="opcion1">Going Up</option>
            <option value="opcion2">Going Down</option>
          </select>

        </div>

      </div>

      <span className="card-label">Origin / Destination </span>
      <div className="input-columns">
        <div className="column">
          <label htmlFor="warehouse_origin">Warehouse:</label>
          <select
            id="warehouse_origin"
            name="warehouse_origin"
            value={formData.warehouse_origin}
            onChange={handleChange}
          >
            <option value="">Seleccionar Warehouse</option>
            {activeWarehouses.map(warehouse => (
              <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>{warehouse.nombre_almacen}</option>
            ))}
          </select>
        </div>
        <div className="column">
          <label htmlFor="warehouse_destination">Warehouse:</label>
          <select
            id="warehouse_destination"
            name="warehouse_destination"
            value={formData.warehouse_destination}
            onChange={handleChange}
          >
            <option value="">Seleccionar Warehouse</option>
            {activeWarehouses.map(warehouse => (
              <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>{warehouse.nombre_almacen}</option>
            ))}
          </select>
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
          <label htmlFor="CI">CI:</label>
          <button type="button" onClick={() => abrirModal('ci')}>Subir documento</button>
          {documentos.ci && (
            <p>{documentos.ci.fileName} - {documentos.ci.vencimiento}</p>
          )}

        </div>
      </div>

      <div className="input-columns">

      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="cita_entrega">Cita Entrega:</label>
          <button type="button" onClick={() => abrirModal('cita_entrega')}>Subir documento</button>
          {documentos.cita_entrega && (
            <p>{documentos.cita_entrega.fileName} - {documentos.cita_entrega.vencimiento}</p>
          )}

        </div>
        <div className="column">
          <label htmlFor="bl">BL:</label>
          <button type="button" onClick={() => abrirModal('bl')}>Subir documento</button>
          {documentos.bl && (
            <p>{documentos.bl.fileName} - {documentos.bl.vencimiento}</p>
          )}

        </div>
        <div className="column">
          <label htmlFor="order_retiro">Orden de Retiro:</label>
          <button type="button" onClick={() => abrirModal('order_retiro')}>Subir documento</button>
          {documentos.order_retiro && (
            <p>{documentos.order_retiro.fileName} - {documentos.order_retiro.vencimiento}</p>
          )}

        </div>
      </div>

      <span className="card-label">Informacion de finalizacion de viaje</span>
      <div className="input-columns">
        <div className="column">
          <label htmlFor="bl_firmado">BL Firmado:</label>
          <button type="button" onClick={() => abrirModal('bl_firmado')}>Subir documento</button>
          {documentos.bl_firmado && (
            <p>{documentos.bl_firmado.fileName} - {documentos.bl_firmado.vencimiento}</p>
          )}
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
      <ModalArchivo
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={(data) => handleGuardarDocumento(campoActual, data)}
        nombreCampo={campoActual}
        valorActual={documentos[campoActual]}
      />

    </form>
  );
};

export default TripForm;