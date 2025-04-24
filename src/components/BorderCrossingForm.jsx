import React, { useState, useEffect } from 'react';
import './css/BorderCrossingForm.css';
import ModalArchivo from './ModalArchivo';
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Swal from 'sweetalert2';



const BorderCrossingForm = ({ tripNumber }) => {

  const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
  const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
  const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
  const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
  const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

  const [documentos, setDocumentos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);
  const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);
  const [loadingDate, setLoadingDate] = useState()
  const [deliveryDate, setDeliveryDate] = useState();



  const [formData, setFormData] = useState({
    trip_number: tripNumber,
    driver_id: '',
    truck_id: '',
    caja_id: '',
    company_id: '',
    ci_number: '',
    // ima_invoice: '',
    travel_direction: '',
    warehouse_origin_id: '',
    warehouse_destination_id: '',
    origin: '',
    destination: '',
    zip_code_origin: '',
    zip_code_destination: '',
    loading_date:  '',
    delivery_date: '',
    // carta_porte: '',
    // ci: '',
    // entry: '',
    // manifiesto: '',
    // cita_entrega: '',
    // bl: '',
    // order_retiro: '',
    // bl_firmado: '',
    rate_tarifa: '',
    millas_pc_miller: '',
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

    if (campo === 'bl' || campo === 'entry' || campo === 'manifiesto') {
      setMostrarFechaVencimientoModal(false);
    } else {
      setMostrarFechaVencimientoModal(true);
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Datos del Border Crossing a enviar:', formData);
    console.log('Documentos a enviar:', documentos);

    try {
      // 1. Enviar la información principal del viaje a trips.php
      const tripDataToSend = new FormData();
      tripDataToSend.append('op', 'Alta');
      tripDataToSend.append('driver_id', formData.driver_id);
      tripDataToSend.append('truck_id', formData.truck_id);
      tripDataToSend.append('caja_id', formData.caja_id);
      tripDataToSend.append('company_id', formData.company_id);
      tripDataToSend.append('ci_number', formData.ci_number);
      tripDataToSend.append('travel_direction', formData.travel_direction);
      tripDataToSend.append('warehouse_origin_id', formData.warehouse_origin_id);
      tripDataToSend.append('warehouse_destination_id', formData.warehouse_destination_id);
      tripDataToSend.append('origin', formData.origin);
      tripDataToSend.append('destination', formData.destination);
      tripDataToSend.append('zip_code_origin', formData.zip_code_origin);
      tripDataToSend.append('zip_code_destination', formData.zip_code_destination);
      const loadingDateISO = loadingDate ? loadingDate.toISOString().split('T')[0] : '';
      const deliveryDateISO = deliveryDate ? deliveryDate.toISOString().split('T')[0] : '';


      tripDataToSend.append('loading_date', loadingDateISO);
      tripDataToSend.append('delivery_date', deliveryDateISO);

      tripDataToSend.append('rate_tarifa', formData.rate_tarifa);
      tripDataToSend.append('millas_pcmiller', formData.millas_pc_miller);
      tripDataToSend.append('trip_number', formData.trip_number);

      console.log('Datos del Border Crossing a enviar:', tripDataToSend);
      console.log('Documentos a enviar:', documentos);


      const tripResponse = await fetch('http://localhost/api/trips.php', {
        method: 'POST',
        body: tripDataToSend,
      });

      const tripResult = await tripResponse.json();

      if (tripResult.status === "success" && tripResult.id) {
        const tripId = tripResult.id;
        Swal.fire({
          icon: 'success',
          title: 'Información del viaje guardada',
          text: 'Ahora se procederá a guardar los documentos.',
          showConfirmButton: false,
          timer: 1500,
        });

        let documentUploadErrors = [];

        // 2. Enviar los documentos adjuntos a trips_docs.php
        for (const [campo, { file, vencimiento }] of Object.entries(documentos)) {
          const documentFormData = new FormData();
          documentFormData.append('op', 'Alta'); // Indica la operación 'Alta' para documentos
          documentFormData.append('trip_id', tripId);
          documentFormData.append('tipo_documento', campo); // 'carta_porte', 'bl', etc.
          documentFormData.append('documento', file);
          if (vencimiento) {
            documentFormData.append('fecha_vencimiento', vencimiento);
          }

          const documentResponse = await fetch('http://localhost/api/trips_docs.php', { // URL al archivo de documentos
            method: 'POST',
            body: documentFormData,
          });

          const documentResult = await documentResponse.json();
          console.log(`Resultado de la carga de ${campo}:`, documentResult);

          if (documentResult.status !== "success") {
            documentUploadErrors.push(`Error al cargar ${campo}: ${documentResult.message || 'Error desconocido'}`);
          }
        }

        if (documentUploadErrors.length > 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error al cargar documentos',
            // html: documentUploadErrors.join('<br>'), // Muestra todos los errores juntos
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Información del viaje y documentos guardados correctamente',
          });
        }

        // Resetear el formulario
        setFormData({
          trip_number: tripNumber,
          driver_id: '',
          truck_id: '',
          caja_id: '',
          company_id: '',
          ci_number: '',
          travel_direction: '',
          warehouse_origin_id: '',
          warehouse_destination_id: '',
          origin: '',
          destination: '',
          zip_code_origin: '',
          zip_code_destination: '',
          loading_date: '',
          delivery_date: '',
          rate_tarifa: '',
          millas_pc_miller: '',
        });
        setDocumentos({});
        setLoadingDate(null);
        setDeliveryDate(null);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar el viaje',
          text: tripResult.message || 'Error al guardar la información del viaje',
        });
      }

    } catch (error) {
      console.error('Error en el proceso de guardado:', error);
      // Se elimina el SweetAlert genérico de error de conexión
    }
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
          <label htmlFor="driver">Driver:</label>
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
            id="company_id"
            name="company_id"
            value={formData.company_id}
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
            <option value="Going Up">Going Up</option>
            <option value="Going Down">Going Down</option>
          </select>

        </div>
      </div>

      <span className="card-label">Origin / Destination </span>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="warehouse_origin_id">Warehouse:</label>
          <select
            id="warehouse_origin_id"
            name="warehouse_origin_id"
            value={formData.warehouse_origin_id}
            onChange={handleChange}
          >
            <option value="">Seleccionar Warehouse</option>
            {activeWarehouses.map(warehouse => (
              <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>{warehouse.nombre_almacen}</option>
            ))}
          </select>
        </div>
        <div className="column">
          <label htmlFor="warehouse_destination_id">Warehouse:</label>
          <select
            id="warehouse_destination_id"
            name="warehouse_destination_id"
            value={formData.warehouse_destination_id}
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
          <label htmlFor="destination">Destination:</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
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
          <DatePicker
            selected={loadingDate}
            onChange={(date) => {
              setLoadingDate(date);
              setFormData(prev => ({
                ...prev,
                loading_date: date ? date.toISOString().split('T')[0] : '',
              }));
            }}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccione fecha"


          />
        </div>
        <div className="column">
          <label htmlFor="delivery_date">Delivery Date:</label>
          <DatePicker
            selected={deliveryDate}
            onChange={(date) => {
              setDeliveryDate(date);
              setFormData(prev => ({
                ...prev,
                delivery_date: date ? date.toISOString().split('T')[0] : '',
              }));
            }}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccione fecha" />
        </div>
      </div>

      <span className="card-label">Docuementos del Viaje</span>
      <div className="input-columns">
        <div className="column">
          <label htmlFor="carta_porte">Carta Porte:</label>
          <button type="button" onClick={() => abrirModal('carta_porte')}>Subir documento</button>
          {documentos.carta_porte && (
            <p>{documentos.carta_porte.fileName} - {documentos.carta_porte.vencimiento}</p>
          )}

        </div>
        <div className="column">
          <label htmlFor="ci">CI:</label>
          <button type="button" onClick={() => abrirModal('ci')}>Subir documento</button>
          {documentos.ci && (
            <p>{documentos.ci.fileName} - {documentos.ci.vencimiento}</p>
          )}

        </div>
      </div>

      <div className="input-columns">
        <div className="column">
          <label htmlFor="entry">Entry:</label>
          <button type="button" onClick={() => abrirModal('entry')}>Subir documento</button>
          {documentos.entry && (
            <p>{documentos.entry.fileName} - {documentos.entry.vencimiento}</p>
          )}

        </div>
        <div className="column">
          <label htmlFor="manifiesto">Manifiesto:</label>
          <button type="button" onClick={() => abrirModal('manifiesto')}>Subir documento</button>
          {documentos.manifiesto && (
            <p>{documentos.manifiesto.fileName} - {documentos.manifiesto.vencimiento}</p>
          )}

        </div>
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
          <label htmlFor="BL_Firmado">BL Firmado:</label>
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

      {modalAbierto && (
        <ModalArchivo
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={(data) => handleGuardarDocumento(campoActual, data)}
          nombreCampo={campoActual}
          valorActual={documentos[campoActual]}
          mostrarFechaVencimiento={mostrarFechaVencimientoModal}
        />
      )}
    </form>
  );
};

export default BorderCrossingForm;