import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import "./css/ExpenseScreen.css";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import useFetchInventoryItems from '../hooks/expense_hooks/useFetchInventoryItems';
import useFetchSubcategories from '../hooks/expense_hooks/useFetchSubcategories';
import useFetchCategories from '../hooks/expense_hooks/useFetchCategories';
import useFetchExpenseTypes from '../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchExchangeRate from '../hooks/useFetchExchangeRate';

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

const ExpenseEdit = () => {
  const { id_gasto } = useParams();
  const apiHost = import.meta.env.VITE_API_HOST;

  // === ESTADOS GENERALES ===
  const [country, setCountry] = useState(null);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [originalAmount, setOriginalAmount] = useState('');
  const { exchangeRate, setExchangeRate } = useFetchExchangeRate();
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [deletedDetails, setDeletedDetails] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketDate, setTicketDate] = useState(new Date());

  // === SELECT HOOKS ===
  const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
  const { maintenanceCategories } = useFetchCategories();
  const { subcategories } = useFetchSubcategories();
  const { inventoryItems, setInventoryItems } = useFetchInventoryItems();

  // === ARCHIVOS ===
  const [files, setFiles] = useState({ facturaPdf: null, ticketJpg: null });

  // === PAISES ===
  const countries = [
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
  ];

  // =============================
  //   CARGA DE DATOS DEL GASTO
  // =============================
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const fd = new FormData();
        fd.append('op', 'getGastoById');
        fd.append('id_gasto', id_gasto);

        const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: fd });
        const json = await res.json();

        if (json.status !== 'success') {
          Swal.fire('Error', json.message || 'No se encontró el gasto', 'error');
          return;
        }

        const data = json.data;
        setExpenseData(data);

        const selectedCountry = countries.find(c => c.value === data.pais) || null;
        setCountry(selectedCountry);
        
        const fechaGastoLocal = new Date(`${data.fecha_gasto}T00:00:00`);
        setExpenseDate(fechaGastoLocal);

        setTotalAmount(parseFloat(data.monto_total || 0).toFixed(2));
        setOriginalAmount(data.monto_total || '');
        setExchangeRate(selectedCountry?.value === 'MX' ? (data.tipo_cambio || '') : '');

        // === ARCHIVOS ===
        const ticket = data.tickets?.find(t => t.tipo_documento?.includes('Ticket')) || null;
        const factura = data.tickets?.find(t => t.tipo_documento?.includes('Factura')) || null;

        setFiles({
          ticketJpg: ticket ? { id_documento: ticket.id_documento, name: ticket.nombre_original, url: ticket.url } : null,
          facturaPdf: factura ? { id_documento: factura.id_documento, name: factura.nombre_original, url: factura.url } : null,
        });
      } catch (err) {
        console.error('Error cargando gasto:', err);
        Swal.fire('Error', 'No se pudo cargar el gasto', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id_gasto]);

  // =============================
  //   MAPEO DE DETALLES
  // =============================
  useEffect(() => {
    if (!expenseData || !expenseTypes.length) return;

    const mappedDetails = (expenseData.detalles || []).map((d) => {
      const match = expenseTypes.find(
        et => et.label.trim().toLowerCase() === (d.tipo_gasto || '').trim().toLowerCase()
      );

      return {
        id: d.id_detalle_gasto,
        expenseType: match ? match.value : null,
        category: d.id_categoria_mantenimiento || null,
        subcategory: d.id_subcategoria_mantenimiento || null,
        itemId: d.id_articulo || null,
        itemDescription: d.descripcion_articulo || '',
        price: d.precio_unitario || '',
        quantity: d.cantidad_articulo || '1',
      };
    });

    setExpenseDetails(mappedDetails);
  }, [expenseData, expenseTypes]);

  // =============================
  //   FUNCIONES DE DETALLES
  // =============================
  const handleDetailChange = (id, field, value) => {
    setExpenseDetails(prev =>
      prev.map(d => d.id === id ? { ...d, [field]: value } : d)
    );
  };

  const handleDeleteDetail = (id) => {
    setExpenseDetails(prev => prev.filter(d => d.id !== id));
    setDeletedDetails(prev => [...prev, id]);
  };

  // =============================
  //   FUNCIONES DE ARCHIVOS
  // =============================
  const handleRemoveFile = (fileType) => {
    const file = files[fileType];
    if (file && file.id_documento) {
      setDeletedFiles(prev => [...prev, file.id_documento]);
    }
    setFiles(prev => ({ ...prev, [fileType]: null }));
  };

  const handleAddFile = (fileType, event) => {
    const file = event.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [fileType]: file }));
  };

  // =============================
  //   GUARDAR CAMBIOS
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("op", "updateExpense");
      fd.append("id_gasto", id_gasto);
      fd.append("detalles", JSON.stringify(expenseDetails));
      fd.append("eliminados", JSON.stringify(deletedDetails));
      fd.append("archivos_eliminados", JSON.stringify(deletedFiles));
      fd.append("monto_total", totalAmount);
      fd.append("pais", country?.value || '');
      fd.append("fecha_gasto", expenseDate.toISOString().split('T')[0]);
      fd.append("fecha_ticket", ticketDate.toISOString().split('T')[0]);


      if (files.facturaPdf && files.facturaPdf instanceof File)
        fd.append("facturaPdf", files.facturaPdf);

      if (files.ticketJpg && files.ticketJpg instanceof File)
        fd.append("ticketJpg", files.ticketJpg);

      const res = await fetch(`${apiHost}/save_expense.php`, { method: "POST", body: fd });
      const json = await res.json();

      if (json.status === "success")
        Swal.fire("Éxito", "El gasto fue actualizado correctamente", "success");
      else
        Swal.fire("Error", json.message || "No se pudo actualizar el gasto", "error");

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Ocurrió un error al actualizar el gasto", "error");
    }
  };

  // =============================
  //   RENDER
  // =============================
  if (loading) {
    return (
      <div className="app-screen-container">
        <div className="app-screen-wrapper" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Cargando gasto...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-screen-container">
      <div className="app-screen-wrapper">
        <div className="app-container">
          <span className="app-label">Edit Expense #{id_gasto}</span>

          <div className="main-content-flex">
            <div className="additional-card">
              <form className="card-container" onSubmit={handleSubmit}>
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => window.history.back()}>
                    Cancelar
                  </button>
                  <button type="submit" className="accept-button">Guardar Cambios</button>
                </div>

                {/* DATOS GENERALES */}
                <div className="form-section">
                  <legend className="card-label">General Expense Data</legend>
                  <div className="input-columns">
                    <div className="column">
                      <label>Expense Country:</label>
                      <Select
                        value={country}
                        onChange={setCountry}
                        options={countries}
                        styles={selectStyles}
                        isClearable
                      />
                    </div>

                    <div className="column">
                      <label>Ticket Date:</label>
                      <DatePicker
                        selected={ticketDate}
                        onChange={(date) => setTicketDate(date)}
                        className="form-input date-picker-full-width"
                      />

                    </div>
                  </div>
                </div>

                <div className="column">
                  <label>Total Amount:</label>
                  <input
                    type="number"
                    className="form-input"
                    step="0.01"
                    min="0"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>


                {/* DETALLES EDITABLES */}
                <div className="form-section">
                  <legend className="card-label">Expense Details</legend>

                  {expenseDetails.length === 0 ? (
                    <p>No details found for this expense.</p>
                  ) : (
                    expenseDetails.map((detail) => (
                      <div key={detail.id} className="detail-item-container">
                        <div className="input-columns">
                          <div className="column">
                            <label>Expense Type:</label>
                            <Select
                              options={expenseTypes}
                              isLoading={typesLoading}
                              value={expenseTypes.find(o => String(o.value) === String(detail.expenseType)) || null}
                              styles={selectStyles}
                              onChange={(opt) => handleDetailChange(detail.id, "expenseType", opt?.value || null)}
                            />
                          </div>

                          <div className="column" style={{ flex: 2 }}>
                            <label>Description:</label>
                            <input
                              type="text"
                              className="form-input"
                              value={detail.itemDescription}
                              onChange={(e) => handleDetailChange(detail.id, "itemDescription", e.target.value)}
                            />
                          </div>

                          <div className="column">
                            <label>Price:</label>
                            <input
                              type="number"
                              className="form-input"
                              value={detail.price}
                              onChange={(e) => handleDetailChange(detail.id, "price", e.target.value)}
                            />
                          </div>

                          <div className="column">
                            <label>Quantity:</label>
                            <input
                              type="number"
                              className="form-input"
                              value={detail.quantity}
                              onChange={(e) => handleDetailChange(detail.id, "quantity", e.target.value)}
                            />
                          </div>

                          <div className="column" style={{ display: "flex", alignItems: "flex-end" }}>
                            <button
                              type="button"
                              className="remove-file-button"
                              style={{ background: "#dc3545", color: "#fff", borderRadius: "6px", padding: "4px 10px" }}
                              onClick={() => handleDeleteDetail(detail.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ARCHIVOS */}
                <div className="form-section">
                  <legend className="card-label">Documents</legend>
                  <div className="input-columns">

                    {/* PDF */}
                    <div className="column">
                      <label>Invoice (PDF)</label>
                      {files.facturaPdf ? (
                        <div className="file-display">
                          <span className="file-icon">📄</span>
                          <a
                            href={files.facturaPdf.url || URL.createObjectURL(files.facturaPdf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            {files.facturaPdf.name || "Nuevo archivo PDF"}
                          </a>
                          <button type="button" className="remove-file-button" onClick={() => handleRemoveFile('facturaPdf')}>
                            X
                          </button>
                        </div>
                      ) : (
                        <input type="file" accept="application/pdf" onChange={(e) => handleAddFile('facturaPdf', e)} />
                      )}
                    </div>

                    {/* Imagen Ticket */}
                    <div className="column">
                      <label>Ticket (Image)</label>
                      {files.ticketJpg ? (
                        <div className="file-display">
                          <PhotoProvider>
                            <PhotoView src={files.ticketJpg.url || URL.createObjectURL(files.ticketJpg)}>
                              <img
                                src={files.ticketJpg.url || URL.createObjectURL(files.ticketJpg)}
                                alt={files.ticketJpg.name || 'Nuevo ticket'}
                                style={{
                                  width: '120px',
                                  height: 'auto',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                                }}
                              />
                            </PhotoView>
                          </PhotoProvider>
                          <div style={{ marginTop: '6px' }}>
                            <span style={{ fontSize: '0.9em', color: '#666' }}>
                              {files.ticketJpg.name || 'Nuevo ticket'}
                            </span>
                            <button type="button" className="remove-file-button" onClick={() => handleRemoveFile('ticketJpg')}>
                              X
                            </button>
                          </div>
                        </div>
                      ) : (
                        <input type="file" accept="image/*" onChange={(e) => handleAddFile('ticketJpg', e)} />
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* VISTA PREVIA */}
            <div className="previsualizador-card">
              <h3 className="preview-title">Expense Summary</h3>
              <p><strong>Country:</strong> {country?.label}</p>
              <p><strong>Date:</strong> {expenseDate.toLocaleDateString()}</p>
              <p><strong>Total:</strong> ${totalAmount}</p>
              <h4>Details:</h4>
              <ul>
                {expenseDetails.map(d => (
                  <li key={d.id}>
                    {d.itemDescription} - {d.quantity} x ${d.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseEdit;
