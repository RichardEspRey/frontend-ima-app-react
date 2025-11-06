import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import "./css/ExpenseScreen.css";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import CreatableSelect from 'react-select/creatable';
import ModalArchivo from '../components/ModalArchivo';

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
  const { id_gasto } = useParams(); // <-- /edit-expense/:id
  const apiHost = import.meta.env.VITE_API_HOST;
  const ID_MANTENIMIENTO = "3";

  // === ESTADOS GENERALES ===
  const [country, setCountry] = useState(null);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [originalAmount, setOriginalAmount] = useState('');
  const { exchangeRate, setExchangeRate, fetchExchangeRate } = useFetchExchangeRate();
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // === SELECT HOOKS ===
  const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
  const { maintenanceCategories, loading: categoriesLoading } = useFetchCategories();
  const { subcategories, loading: subcategoriesLoading } = useFetchSubcategories();
  const { inventoryItems, loading: itemsLoading, setInventoryItems } = useFetchInventoryItems();

  // === ARCHIVOS ===
  const [modalState, setModalState] = useState({ isOpen: false, fileType: null });
  const [files, setFiles] = useState({ facturaPdf: null, ticketJpg: null });

  // === PAISES ===
  const countries = [
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
  ];

  // === CARGA DE DATOS DEL GASTO ===
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

        // === 1) GENERAL ===
        const selectedCountry = countries.find(c => c.value === data.pais) || null;
        setCountry(selectedCountry);
        setExpenseDate(new Date(data.fecha_gasto));
        setTotalAmount(parseFloat(data.monto_total || 0).toFixed(2));
        setOriginalAmount(data.monto_total || '');
        setExchangeRate(selectedCountry?.value === 'MX' ? (data.tipo_cambio || '') : '');

        // === 2) DETALLES ===
        const mappedDetails = (data.detalles || []).map((d) => ({
          id: d.id_detalle_gasto,
          expenseType: expenseTypes.find(et => et.label === d.tipo_gasto)?.value || null,
          category: d.id_categoria_mantenimiento || null,
          subcategory: d.id_subcategoria_mantenimiento || null,
          itemId: d.id_articulo || null,
          itemDescription: d.descripcion_articulo || '',
          price: d.precio_unitario || '',
          quantity: d.cantidad_articulo || '1',
        }));
        setExpenseDetails(mappedDetails);

        // === 3) ARCHIVOS ===
        const ticket = data.tickets?.find(t => t.tipo_documento?.includes('Ticket')) || null;
        const factura = data.tickets?.find(t => t.tipo_documento?.includes('Factura')) || null;

        setFiles({
          ticketJpg: ticket ? { name: ticket.nombre_original, url: ticket.url } : null,
          facturaPdf: factura ? { name: factura.nombre_original, url: factura.url } : null,
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

  // === FUNCIONES GENERALES (reutilizadas) ===
  const handleRemoveFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
  };

  const getSubtotal = (price, quantity) => {
    if (price && quantity) {
      return (parseFloat(price) * parseInt(quantity)).toFixed(2);
    }
    return '0.00';
  };

  if (loading) {
    return (
      <div className="app-screen-container">
        <div className="app-screen-wrapper" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Cargando gasto...</h2>
        </div>
      </div>
    );
  }

  // Aquí podrías mantener el mismo layout y formulario que tu ExpenseScreen original,
  // solo que ahora los campos ya vendrán precargados desde la API.

  return (
    <div className="app-screen-container">
      <div className="app-screen-wrapper">
        <div className="app-container">
          <span className="app-label">Edit Expense #{id_gasto}</span>

          <div className="main-content-flex">
            <div className="additional-card">
              <form className="card-container">
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => window.history.back()}>
                    Cancelar
                  </button>
                  <button type="submit" className="accept-button">Guardar Cambios</button>
                </div>

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
                        selected={expenseDate}
                        onChange={(date) => setExpenseDate(date)}
                        className="form-input date-picker-full-width"
                      />
                    </div>
                  </div>
                </div>

                <div className="column">
                  <label>Total Amount:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`$${totalAmount}`}
                    readOnly
                  />
                </div>

                {/* Lista de detalles */}
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
                              value={expenseTypes.find(o => o.value === detail.expenseType)}
                              styles={selectStyles}
                              isDisabled
                            />
                          </div>
                          <div className="column">
                            <label>Price:</label>
                            <input type="number" className="form-input" value={detail.price} readOnly />
                          </div>
                          <div className="column">
                            <label>Quantity:</label>
                            <input type="number" className="form-input" value={detail.quantity} readOnly />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Archivos */}
                <div className="form-section">
                  <legend className="card-label">Documents</legend>
                  <div className="input-columns">
                    <div className="column">
                      <label>Invoice (PDF)</label>
                      {files.facturaPdf ? (
                        <div className="file-display">
                          <span className="file-icon">📄</span>
                          <a href={files.facturaPdf.url} target="_blank" rel="noopener noreferrer">
                            {files.facturaPdf.name}
                          </a>
                          <button type="button" className="remove-file-button" onClick={() => handleRemoveFile('facturaPdf')}>
                            X
                          </button>
                        </div>
                      ) : (
                        <p>No PDF attached.</p>
                      )}
                    </div>

                    <div className="column">
                      <label>Ticket (Image)</label>
                      {files.ticketJpg ? (
                        <div className="file-display">
                          <span className="file-icon">🖼️</span>
                          <a href={files.ticketJpg.url} target="_blank" rel="noopener noreferrer">
                            {files.ticketJpg.name}
                          </a>
                          <button type="button" className="remove-file-button" onClick={() => handleRemoveFile('ticketJpg')}>
                            X
                          </button>
                        </div>
                      ) : (
                        <p>No image attached.</p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Vista previa */}
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
