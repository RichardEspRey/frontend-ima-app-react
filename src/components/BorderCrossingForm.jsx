import React, { useState, useEffect } from 'react';
import ModalArchivo from './ModalArchivo';
import './css/BorderCrossingForm.css';
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { format } from 'date-fns';


const initialBorderCrossingDocs = {
  ima_invoice: null, carta_porte: null, ci: null, entry: null,
  manifiesto: null, cita_entrega: null, bl: null, orden_retiro: null, bl_firmado: null,
};

const initialNormalTripDocs = {
  ima_invoice: null, ci: null,
  cita_entrega: null, bl: null, bl_firmado: null,

};

const selectStyles = {
  control: (provided) => ({
    ...provided,
    padding: '4px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    minHeight: '40px',
  }),

};

const BorderCrossingForm = ({ tripNumber }) => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
  const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
  const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
  const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
  const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false)

  const [companyOptions, setCompanyOptions] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  const [modalAbierto, setModalAbierto] = useState(false);

  const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null });
  const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);




  const [formData, setFormData] = useState({
    trip_number: tripNumber || '',
    driver_id: '',
    truck_id: '',
    caja_id: '',
  });

  const [etapas, setEtapas] = useState([{
    stage_number: 1,
    stageType: 'borderCrossing',
    origin: '',
    destination: '',
    zip_code_origin: '',
    zip_code_destination: '',
    loading_date: null,
    delivery_date: null,
    company_id: '',
    travel_direction: '',
    warehouse_origin_id: '',
    warehouse_destination_id: '',
    ci_number: '',
    rate_tarifa: '',
    millas_pcmiller: '',
    documentos: { ...initialBorderCrossingDocs } // Documentos para cruce

  }]);



  useEffect(() => {
    if (activeCompanies) {
      setCompanyOptions(activeCompanies.map(c => ({ value: c.company_id, label: c.nombre_compania })));
    }
  }, [activeCompanies]);

  useEffect(() => {
    if (activeWarehouses) {
      setWarehouseOptions(activeWarehouses.map(w => ({ value: w.warehouse_id, label: w.nombre_almacen })));
    }
  }, [activeWarehouses]);

  const handleCreateCompany = async (inputValue, stageIndex) => {

    setIsCreatingCompany(true);


    const newCompanyFormData = new FormData();
    newCompanyFormData.append('op', 'CreateCompany');
    newCompanyFormData.append('nombre_compania', inputValue);


    try {
      const response = await fetch(`${apiHost}/companies.php`, {
        method: 'POST',
        body: newCompanyFormData,
      });



      const result = await response.json();
      console.log("Respuesta del backend (result):", result);

      if (result.status === "success" && result.company && result.company.company_id) {
        const newOption = { value: result.company.company_id, label: result.company.nombre_compania };

        setCompanyOptions(prevOptions => [...prevOptions, newOption]);


        handleEtapaChange(stageIndex, 'company_id', newOption.value);

        Swal.fire('¡Éxito!', `Compañía "${inputValue}" creada y seleccionada.`, 'success');
      } else {
        Swal.fire('Error', `No se pudo crear la compañía: ${result.message || 'Error desconocido del servidor.'}`, 'error');
      }
    } catch (error) {
      console.error("Error creando compañía:", error);
      Swal.fire('Error', 'Error de conexión al crear la compañía.', 'error');
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleCreateWarehouse = async (inputValue, stageIndex, warehouseFieldKey) => {

    setIsCreatingWarehouse(true);


    const newWarehouseFormData = new FormData();
    newWarehouseFormData.append('op', 'CreateWarehouse');
    newWarehouseFormData.append('nombre_almacen', inputValue);


    try {
      const response = await fetch(`${apiHost}/warehouses.php`, {
        method: 'POST',
        body: newWarehouseFormData,
      });
      const result = await response.json();

      if (result.status === "success" && result.warehouse && result.warehouse.warehouse_id) {
        const newOption = { value: result.warehouse.warehouse_id, label: result.warehouse.nombre_almacen };

        setWarehouseOptions(prevOptions => [...prevOptions, newOption]);
        handleEtapaChange(stageIndex, warehouseFieldKey, newOption.value);

        Swal.fire('¡Éxito!', `Bodega "${inputValue}" creada y seleccionada.`, 'success');
      } else {
        Swal.fire('Error', `No se pudo crear la bodega: ${result.message || 'Error desconocido del servidor.'}`, 'error');
      }
    } catch (error) {
      console.error("Error creando bodega:", error);
      Swal.fire('Error', 'Error de conexión al crear la bodega.', 'error');
    } finally {
      setIsCreatingWarehouse(false);
    }
  };


  useEffect(() => {
    setFormData(prevFormData => ({
      ...prevFormData,
      trip_number: tripNumber || '',
    }));
  }, [tripNumber]);


  const setForm = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEtapaChange = (index, field, value) => {
    setEtapas(prevEtapas => {
      const updatedEtapas = [...prevEtapas];

      const updatedEtapa = { ...updatedEtapas[index] };
      updatedEtapa[field] = value;
      updatedEtapas[index] = updatedEtapa;
      return updatedEtapas;
    });
  };


  const handleGuardarDocumentoEtapa = (data) => {
    const { stageIndex, docType } = modalTarget;
    if (stageIndex === null || !docType) return;
    setEtapas(prevEtapas => {
      const updatedEtapas = [...prevEtapas];
      const updatedEtapa = {
        ...updatedEtapas[stageIndex],

        documentos: {
          ...updatedEtapas[stageIndex].documentos,
          [docType]: data
        }
      };
      updatedEtapas[stageIndex] = updatedEtapa;
      return updatedEtapas;
    });

    setModalAbierto(false);
    setModalTarget({ stageIndex: null, docType: null });
  };

  const handleGuardarDocumentoGlobal = (docType, data) => {
    setFormData(prev => ({
      ...prev,
      [docType]: data
    }));
    setModalAbierto(false);
    setModalTarget({ stageIndex: null, docType: null });
  };


  const abrirModal = (docType, stageIndex = null) => {
    setModalTarget({ stageIndex, docType });
    setModalAbierto(true);


    if (['ima_invoice', 'carta_porte', 'ci', 'entry', 'manifiesto', 'cita_entrega', 'bl', 'orden_retiro', 'bl_firmado'].includes(docType)) {
      setMostrarFechaVencimientoModal(false);
    } else {
      setMostrarFechaVencimientoModal(true);
    }
  };


  const getCurrentDocValueForModal = () => {
    const { stageIndex, docType } = modalTarget;
    if (docType === null) return null;

    if (stageIndex !== null && etapas[stageIndex]) {

      return etapas[stageIndex].documentos[docType] || null;
    } else {

      return formData[docType] || null;
    }
  };



  const agregarNuevaEtapa = (tipoEtapa) => {
    let initialDocs;
    // Determinar qué estructura de documentos usar
    if (tipoEtapa === 'borderCrossing') {
      initialDocs = { ...initialBorderCrossingDocs };
    } else if (tipoEtapa === 'normalTrip') {
      initialDocs = { ...initialNormalTripDocs };
    } else {
      console.warn("Tipo de etapa desconocido:", tipoEtapa, ". Usando documentos vacíos.");
      initialDocs = {};
    }

    setEtapas(prevEtapas => [
      ...prevEtapas,
      {
        stage_number: prevEtapas.length + 1,
        stageType: tipoEtapa,
        origin: '', destination: '', zip_code_origin: '', zip_code_destination: '',
        loading_date: null, delivery_date: null, company_id: null, travel_direction: '',
        warehouse_origin_id: null, warehouse_destination_id: null, ci_number: '',
        rate_tarifa: '', millas_pcmiller: '', estatus: 'In Transit',
        documentos: initialDocs
      }
    ]);
  };



  const eliminarEtapa = (index) => {
    if (etapas.length <= 1) { Swal.fire('Info', 'Debe haber al menos una etapa.', 'info'); return; }
    Swal.fire({
      title: `¿Eliminar Etapa ${etapas[index].stage_number}?`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        setEtapas(prev => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, stage_number: i + 1 })));
      }
    });
  };



  const handleSubmit = async (event) => {
    event.preventDefault();


    if (!formData.driver_id || !formData.truck_id) {
      Swal.fire('Campos incompletos', 'Por favor, seleccione Driver y Truck.', 'warning');
      return;
    }
    // Validar campos obligatorios de cada etapa
    for (let i = 0; i < etapas.length; i++) {
      const etapa = etapas[i];
      if (!etapa.company_id || !etapa.travel_direction || !etapa.warehouse_origin_id || !etapa.warehouse_destination_id || !etapa.origin || !etapa.destination) {
        Swal.fire('Campos incompletos', `Por favor, complete los campos obligatorios (Company, Direction, Warehouses, Origin, Destination) de la Etapa ${etapa.stage_number}.`, 'warning');
        return;
      }

    }


    const dataToSend = new FormData();
    dataToSend.append('op', 'Alta');


    dataToSend.append('trip_number', formData.trip_number);
    dataToSend.append('driver_id', formData.driver_id);
    dataToSend.append('truck_id', formData.truck_id);
    dataToSend.append('caja_id', formData.caja_id || '');



    // Procesar y añadir etapas (como JSON) y sus archivos
    const etapasParaJson = etapas.map(etapa => ({
      ...etapa,
      // Formatear fechas a yyyy-MM-dd ANTES de stringify
      loading_date: etapa.loading_date ? format(etapa.loading_date, 'yyyy-MM-dd') : null,
      delivery_date: etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : null,

      documentos: Object.entries(etapa.documentos).reduce((acc, [key, value]) => {
        if (value) { // Si hay datos para este tipo de documento
          acc[key] = {
            fileName: value.fileName || '',
            vencimiento: value.vencimiento || null

          };
        } else {
          acc[key] = null;
        }
        return acc;
      }, {})
    }));


    dataToSend.append('etapas', JSON.stringify(etapasParaJson));

    //  documentos de CADA etapa a FormData
    etapas.forEach((etapa, index) => {
      Object.entries(etapa.documentos).forEach(([docType, docData]) => {

        if (docData && docData.file instanceof File) {

          const fieldName = `etapa_${index}_${docType}_file`;
          dataToSend.append(fieldName, docData.file, docData.fileName);
        }
      });
    });


    console.log("--- FormData a enviar ---");
    for (let [key, value] of dataToSend.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("--- Fin FormData ---");

    try {
      const apiUrl = `${apiHost}/new_trips.php`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: dataToSend,

      });


      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (response.ok && result.status === "success") {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: result.message || 'Viaje y etapas guardados correctamente.',
          timer: 2500,
          showConfirmButton: false
        });


        setFormData({
          trip_number: '',
          driver_id: '', truck_id: '', caja_id: '',
          // ima_invoice: null, bl_firmado: null
        });
        setEtapas([{
          stage_number: 1, origin: '', destination: '', zip_code_origin: '', zip_code_destination: '',
          loading_date: null, delivery_date: null, company_id: '', travel_direction: '',
          warehouse_origin_id: '', warehouse_destination_id: '', ci_number: '',
          rate_tarifa: '', millas_pcmiller: '',
          documentos: { ...initialBorderCrossingDocs }
        }]);

      } else {

        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: result.error || result.message || 'No se pudo guardar la información. Verifica los datos e intenta de nuevo.',
        });
      }

    } catch (error) {
      console.error('Error en fetch o procesando respuesta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo comunicar con el servidor. Verifica tu conexión o contacta al administrador. Detalles: ' + error.message,
      });
    }
  };

  return (

    <form onSubmit={handleSubmit} className="card-container">


      <div className="form-actions">
        <button type="button" className="cancel-button" onClick={() => console.log('Cancelar presionado')}>Cancelar</button>
        <button type="submit" className="accept-button">Guardar Viaje</button>
      </div>

      <div className="form-section">
        <legend className="card-label">Información General del Viaje</legend>
        <div className="input-columns">
          <div className="column">
            <label htmlFor="driver_id">Driver:</label>
            <Select
              id="driver_id" name="driver_id"
              value={activeDrivers.find(d => d.driver_id === formData.driver_id) ? { value: formData.driver_id, label: activeDrivers.find(d => d.driver_id === formData.driver_id).nombre } : null}
              onChange={(selected) => setForm('driver_id', selected ? selected.value : '')}
              options={activeDrivers.map(driver => ({ value: driver.driver_id, label: driver.nombre }))}
              placeholder="Seleccionar Driver"
              isLoading={loadingDrivers}
              isDisabled={loadingDrivers || !!errorDrivers}
              styles={selectStyles} isClearable
            />
            {errorDrivers && <p className="error-text">Error cargando drivers</p>}

          </div>

          <div className="column">
            <label htmlFor="truck_id" >Truck:</label>
            <Select
              id="truck_id" name="truck_id"
              value={activeTrucks.find(t => t.truck_id === formData.truck_id) ? { value: formData.truck_id, label: activeTrucks.find(t => t.truck_id === formData.truck_id).unidad } : null}
              onChange={(selected) => setForm('truck_id', selected ? selected.value : '')}
              options={activeTrucks.map(truck => ({ value: truck.truck_id, label: truck.unidad }))}
              placeholder="Seleccionar Truck"
              isLoading={loadingTrucks}
              isDisabled={loadingTrucks || !!errorTrucks}
              styles={selectStyles} isClearable
            />
            {errorTrucks && <p className="error-text">Error cargando trucks</p>}

          </div>

          <div className="column">
            <label htmlFor="caja_id" >Trailer (Caja):</label>
            <Select
              id="caja_id" name="caja_id"
              value={activeTrailers.find(c => c.caja_id === formData.caja_id) ? { value: formData.caja_id, label: activeTrailers.find(c => c.caja_id === formData.caja_id).no_caja } : null}
              onChange={(selected) => setForm('caja_id', selected ? selected.value : '')}
              options={activeTrailers.map(caja => ({ value: caja.caja_id, label: caja.no_caja }))}
              placeholder="Seleccionar Trailer"
              isLoading={loadingCajas}
              isDisabled={loadingCajas || !!errorCajas}
              styles={selectStyles} isClearable
            />
            {errorCajas && <p className="error-text">Error cargando trailers</p>}
          </div>


        



        </div>


      </div>

      <br />

      {/* --- Sección de Etapas Dinámicas --- */}
      {etapas.map((etapa, index) => (
        <div key={index} className="etapa-container form-section">
          <div className="card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '10px', marginBottom: '10px' }}>
            {/* Mostrar tipo de etapa */}
            <span>{`Etapa ${etapa.stage_number} (${etapa.stageType === 'borderCrossing' ? 'Cruce Fronterizo' : 'Viaje Normal'})`}</span>
            {etapas.length > 0 && ( // Permitir borrar incluso si solo queda una (se validará al guardar)
              <button type="button" className="delete-button" onClick={() => eliminarEtapa(index)} title="Eliminar Etapa">&#x2716;</button>
            )}
          </div>

          <legend className="card-label">Origen / Destino</legend>
          <div className="input-columns">
            <div className="column">
              <label htmlFor={`company_id-${index}`}>Company:</label>
              <CreatableSelect
                id={`company_id-${index}`}
                name={`company_id-${index}`}
                isClearable
                value={companyOptions.find(c => c.value === etapa.company_id) || null}
                onChange={(selected) => handleEtapaChange(index, 'company_id', selected ? selected.value : '')}
                onCreateOption={(inputValue) => handleCreateCompany(inputValue, index)}
                options={companyOptions}
                placeholder="Seleccionar o Crear Compañía"
                isLoading={loadingCompanies || isCreatingCompany}

                styles={selectStyles}
                formatCreateLabel={(inputValue) => `Crear nueva compañía: "${inputValue}"`}
              />
              {/* {errorCompanies && <p className="error-text">Error cargando companies</p>} */}

            </div>

            <div className="column">
              <label htmlFor={`travel_direction-${index}`}>Travel Direction:</label>
              <Select
                id={`travel_direction-${index}`} name={`travel_direction-${index}`}
                value={etapa.travel_direction ? { value: etapa.travel_direction, label: etapa.travel_direction } : null}
                onChange={(selected) => handleEtapaChange(index, 'travel_direction', selected ? selected.value : '')}
                options={[{ value: 'Going Up', label: 'Going Up' }, { value: 'Going Down', label: 'Going Down' }]}
                placeholder="Seleccionar Dirección"
                styles={selectStyles} isClearable
              />
            </div>

            <div className="column">
              <label htmlFor="ci_number">CI Number:</label>
              <input
                type="text" id={`ci_number-${index}`} name={`ci_number-${index}`}
                value={etapa.ci_number}
                onChange={(e) => handleEtapaChange(index, 'ci_number', e.target.value)}
                placeholder="Número CI"
                className="form-input"
              />
            </div>
          </div>

          <div className="input-columns">
            <div className="column">
              <label htmlFor={`warehouse_origin_id-${index}`} style={{ marginTop: '10px' }}>Origin Warehouse:</label>
              <CreatableSelect // << --- CAMBIO AQUÍ
                id={`warehouse_origin_id-${index}`}
                name={`warehouse_origin_id-${index}`}
                isClearable
                value={warehouseOptions.find(w => w.value === etapa.warehouse_origin_id) || null}
                onChange={(selected) => handleEtapaChange(index, 'warehouse_origin_id', selected ? selected.value : '')}
                onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_origin_id')}
                options={warehouseOptions}
                placeholder="Seleccionar o Crear Bodega Origen"
                isLoading={loadingWarehouses || isCreatingWarehouse}

                styles={selectStyles}
                formatCreateLabel={(inputValue) => `Crear nueva bodega: "${inputValue}"`}
              />
              {/* {errorWarehouses && <p className="error-text">Error cargando warehouses</p>} */}
            </div>

            <div className="column">
              <label htmlFor={`warehouse_destination_id-${index}`} style={{ marginTop: '10px' }}>Destination Warehouse:</label>
              <CreatableSelect
                id={`warehouse_destination_id-${index}`}
                name={`warehouse_destination_id-${index}`}
                isClearable
                value={warehouseOptions.find(w => w.value === etapa.warehouse_destination_id) || null}
                onChange={(selected) => handleEtapaChange(index, 'warehouse_destination_id', selected ? selected.value : '')}
                onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_destination_id')}
                options={warehouseOptions}
                placeholder="Seleccionar o Crear Bodega Destino"
                isLoading={loadingWarehouses || isCreatingWarehouse}

                styles={selectStyles}
                formatCreateLabel={(inputValue) => `Crear nueva bodega: "${inputValue}"`}
              />

            </div>
          </div>

          <div className="input-columns">
            <div className="column">
              <label htmlFor={`origin-${index}`} style={{ marginTop: '10px' }}>Origin City/State:</label>
              <input
                type="text" id={`origin-${index}`} name={`origin-${index}`}
                value={etapa.origin}
                onChange={(e) => handleEtapaChange(index, 'origin', e.target.value)}
                placeholder="Ciudad/Estado Origen"
                className="form-input"
              />

            </div>

            <div className="column">
              <label htmlFor={`destination-${index}`} style={{ marginTop: '10px' }}>Destination City/State:</label>
              <input
                type="text" id={`destination-${index}`} name={`destination-${index}`}
                value={etapa.destination}
                onChange={(e) => handleEtapaChange(index, 'destination', e.target.value)}
                placeholder="Ciudad/Estado Destino"
                className="form-input"
              />

            </div>
          </div>

          <div className="input-columns">
            <div className="column">
              <label htmlFor={`zip_code_origin-${index}`}>Zip Code Origin:</label>
              <input
                type="text" id={`zip_code_origin-${index}`} name={`zip_code_origin-${index}`}
                value={etapa.zip_code_origin}
                onChange={(e) => handleEtapaChange(index, 'zip_code_origin', e.target.value)}
                placeholder="Zip Origen" className="form-input"
              />

            </div>

            <div className="column">
              <label htmlFor={`zip_code_destination-${index}`} >Zip Code Destination:</label>
              <input
                type="text" id={`zip_code_destination-${index}`} name={`zip_code_destination-${index}`}
                value={etapa.zip_code_destination}
                onChange={(e) => handleEtapaChange(index, 'zip_code_destination', e.target.value)}
                placeholder="Zip Destino" className="form-input"
              />
            </div>
          </div>

          <div className="input-columns">
            <div className="column">
              <label htmlFor={`loading_date-${index}`} style={{ marginTop: '10px' }}>Loading Date:</label>
              <DatePicker
                selected={etapa.loading_date}
                onChange={(date) => handleEtapaChange(index, 'loading_date', date)}
                dateFormat="dd/MM/yyyy" // Formato visual
                placeholderText="Fecha Carga"
                className="form-input date-picker-full-width" // Clase para ancho completo
                isClearable
              />

            </div>

            <div className="column">
              <label htmlFor={`delivery_date-${index}`} style={{ marginTop: '10px' }}>Delivery Date:</label>
              <DatePicker
                selected={etapa.delivery_date}
                onChange={(date) => handleEtapaChange(index, 'delivery_date', date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Fecha Entrega"
                className="form-input date-picker-full-width"
                isClearable
              />
            </div>


          </div>

          <div className="input-columns">


            <div className="column">


              <label htmlFor={`rate_tarifa-${index}`} >Rate Tarifa:</label>
              <input
                type="number" id={`rate_tarifa-${index}`} name={`rate_tarifa-${index}`}
                value={etapa.rate_tarifa}
                onChange={(e) => handleEtapaChange(index, 'rate_tarifa', e.target.value)}
                placeholder="Ej: 1500.50"
                className="form-input"
              />

            </div>
            <div className="column">
              <label htmlFor={`millas_pcmiller-${index}`} >Millas PC Miller:</label>
              <input
                type="number" id={`millas_pcmiller-${index}`} name={`millas_pcmiller-${index}`}
                value={etapa.millas_pcmiller}
                onChange={(e) => handleEtapaChange(index, 'millas_pcmiller', e.target.value)}
                placeholder="Ej: 850"
                className="form-input"
              />
            </div>


          </div>




          {etapa.stageType === 'borderCrossing' && (

            <div className="subsection">
              <legend className="card-label">Documentos de Etapa {etapa.stage_number}</legend>
              <div className="input-columns">

                <div className="column">
                  <div className="column">
                    <label htmlFor={`ima_invoice-${index}`}>IMA Invoice:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('ima_invoice', index)}>Subir</button>
                    {etapa.documentos?.ima_invoice && (<p className="doc-info"><i>{etapa.documentos.ima_invoice.fileName}{etapa.documentos.ima_invoice.vencimiento ? ` - V: ${etapa.documentos.ima_invoice.vencimiento}` : ''}</i></p>)}
                  </div>
                  <div className="column">
                    <label htmlFor={`carta_porte-${index}`}>Carta Porte:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('carta_porte', index)}>Subir</button>
                    {etapa.documentos?.carta_porte && (<p className="doc-info"><i>{etapa.documentos.carta_porte.fileName}{etapa.documentos.carta_porte.vencimiento ? ` - V: ${etapa.documentos.carta_porte.vencimiento}` : ''}</i></p>)}
                  </div>
                  <div className="column">
                    <label htmlFor={`ci-${index}`}>CI:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('ci', index)}>Subir</button>
                    {etapa.documentos?.ci && (<p className="doc-info"><i>{etapa.documentos.ci.fileName}{etapa.documentos.ci.vencimiento ? ` - V: ${etapa.documentos.ci.vencimiento}` : ''}</i></p>)}
                  </div>
                </div>

                <div className="column">
                  <div className="column">
                    <label htmlFor={`entry-${index}`}>Entry:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('entry', index)}>Subir</button>
                    {etapa.documentos?.entry && (<p className="doc-info"><i>{etapa.documentos.entry.fileName}</i></p>)}
                  </div>
                  <div className="column">
                    <label htmlFor={`manifiesto-${index}`}>Manifiesto:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('manifiesto', index)}>Subir</button>
                    {etapa.documentos?.manifiesto && (<p className="doc-info"><i>{etapa.documentos.manifiesto.fileName}</i></p>)}
                  </div>
                  <div className="column">
                    <label htmlFor={`cita_entrega-${index}`}>Cita Entrega:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('cita_entrega', index)}>Subir</button>
                    {etapa.documentos?.cita_entrega && (<p className="doc-info"><i>{etapa.documentos.cita_entrega.fileName}{etapa.documentos.cita_entrega.vencimiento ? ` - V: ${etapa.documentos.cita_entrega.vencimiento}` : ''}</i></p>)}
                  </div>
                </div>

                <div className="column">
                  <div className="column">
                    <label htmlFor={`bl-${index}`}>BL:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('bl', index)}>Subir</button>
                    {etapa.documentos?.bl && (<p className="doc-info"><i>{etapa.documentos.bl.fileName}</i></p>)}
                  </div>
                  <div className="column">
                    <label htmlFor={`orden_retiro-${index}`}>Orden Retiro:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('orden_retiro', index)}>Subir</button>
                    {etapa.documentos?.orden_retiro && (<p className="doc-info"><i>{etapa.documentos.orden_retiro.fileName}{etapa.documentos.orden_retiro.vencimiento ? ` - V: ${etapa.documentos.orden_retiro.vencimiento}` : ''}</i></p>)}
                  </div>
                  <div className="column">
                    <label htmlFor={`bl_firmado-${index}`}>BL Firmado:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('bl_firmado', index)}>Subir</button>
                    {etapa.documentos?.bl_firmado && (<p className="doc-info"><i>{etapa.documentos.bl_firmado.fileName}{etapa.documentos.bl_firmado.vencimiento ? ` - V: ${etapa.documentos.bl_firmado.vencimiento}` : ''}</i></p>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {etapa.stageType === 'normalTrip' && (
            <div className="subsection">
              <legend className="card-label">Documentos de Etapa {etapa.stage_number}</legend>
              <div className="input-columns">

                <div className="column">
                  <div className="column">
                    <label htmlFor={`ima_invoice-${index}`}>IMA Invoice:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('ima_invoice', index)}>Subir</button>
                    {etapa.documentos?.ima_invoice && (<p className="doc-info"><i>{etapa.documentos.ima_invoice.fileName}{etapa.documentos.ima_invoice.vencimiento ? ` - V: ${etapa.documentos.ima_invoice.vencimiento}` : ''}</i></p>)}
                  </div>
                  {/* <div className="column">
                    <label htmlFor={`carta_porte-${index}`}>Carta Porte:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('carta_porte', index)}>Subir</button>
                    {etapa.documentos?.carta_porte && (<p className="doc-info"><i>{etapa.documentos.carta_porte.fileName}{etapa.documentos.carta_porte.vencimiento ? ` - V: ${etapa.documentos.carta_porte.vencimiento}` : ''}</i></p>)}
                  </div> */}
                  <div className="column">
                    <label htmlFor={`ci-${index}`}>CI:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('ci', index)}>Subir</button>
                    {etapa.documentos?.ci && (<p className="doc-info"><i>{etapa.documentos.ci.fileName}{etapa.documentos.ci.vencimiento ? ` - V: ${etapa.documentos.ci.vencimiento}` : ''}</i></p>)}
                  </div>

                  <div className="column">
                    <label htmlFor={`cita_entrega-${index}`}>Cita Entrega:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('cita_entrega', index)}>Subir</button>
                    {etapa.documentos?.cita_entrega && (<p className="doc-info"><i>{etapa.documentos.cita_entrega.fileName}{etapa.documentos.cita_entrega.vencimiento ? ` - V: ${etapa.documentos.cita_entrega.vencimiento}` : ''}</i></p>)}
                  </div>
                </div>



                <div className="column">
                  <div className="column">
                    <label htmlFor={`bl-${index}`}>BL:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('bl', index)}>Subir</button>
                    {etapa.documentos?.bl && (<p className="doc-info"><i>{etapa.documentos.bl.fileName}</i></p>)}
                  </div>
                  {/* <div className="column">
                    <label htmlFor={`orden_retiro-${index}`}>Orden Retiro:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('orden_retiro', index)}>Subir</button>
                    {etapa.documentos?.orden_retiro && (<p className="doc-info"><i>{etapa.documentos.orden_retiro.fileName}{etapa.documentos.orden_retiro.vencimiento ? ` - V: ${etapa.documentos.orden_retiro.vencimiento}` : ''}</i></p>)}
                  </div> */}
                  <div className="column">
                    <label htmlFor={`bl_firmado-${index}`}>BL Firmado:</label>
                    <button type="button" className="upload-button" onClick={() => abrirModal('bl_firmado', index)}>Subir</button>
                    {etapa.documentos?.bl_firmado && (<p className="doc-info"><i>{etapa.documentos.bl_firmado.fileName}{etapa.documentos.bl_firmado.vencimiento ? ` - V: ${etapa.documentos.bl_firmado.vencimiento}` : ''}</i></p>)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <br />
      {/* --- *** BOTONES SEPARADOS PARA AÑADIR ETAPAS *** --- */}
      <div className="add-stage-buttons-container">
        <button type="button" onClick={() => agregarNuevaEtapa('borderCrossing')} className="add-stage-button">
          + Añadir Etapa Cruce
        </button>
        <button type="button" onClick={() => agregarNuevaEtapa('normalTrip')} className="add-stage-button">
          + Añadir Etapa Normal
        </button>

      </div>

      {modalAbierto && (
        <ModalArchivo
          isOpen={modalAbierto}
          onClose={() => {
            setModalAbierto(false);
            setModalTarget({ stageIndex: null, docType: null });
          }}

          onSave={modalTarget.stageIndex !== null ? handleGuardarDocumentoEtapa : handleGuardarDocumentoGlobal}
          nombreCampo={modalTarget.docType}
          valorActual={getCurrentDocValueForModal()}
          mostrarFechaVencimiento={mostrarFechaVencimientoModal}
        />
      )}
    </form>
  );
};

export default BorderCrossingForm;
