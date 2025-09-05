import React, { useState, useEffect } from 'react';
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

const ExpenseScreen = () => {
    // --- ESTADOS GENERALES DEL GASTO ---
    const apiHost = import.meta.env.VITE_API_HOST;
    const [country, setCountry] = useState(null);
    const ID_MANTENIMIENTO = "3"
    const [expenseDate, setExpenseDate] = useState(new Date());
    const [totalAmount, setTotalAmount] = useState('0.00');
    const [originalAmount, setOriginalAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState('');

    const [expenseDetails, setExpenseDetails] = useState([]);

    const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
    const { maintenanceCategories, loading: categoriesLoading } = useFetchCategories();
    const { subcategories, loading: subcategoriesLoading } = useFetchSubcategories();
    const { inventoryItems, loading: itemsLoading, setInventoryItems } = useFetchInventoryItems();


    const [modalState, setModalState] = useState({
        isOpen: false,
        fileType: null,
    });
    const [files, setFiles] = useState({
        facturaPdf: null,
        ticketJpg: null,
    });


    const resetForm = () => {
        setCountry(null);
        setExpenseDate(new Date());
        setTotalAmount('0.00');
        setOriginalAmount('');
        setExchangeRate('');
        setExpenseDetails([]);
        setFiles({ facturaPdf: null, ticketJpg: null });
      
    };


    useEffect(() => {

        if (originalAmount && exchangeRate) {
            const convertedAmount = parseFloat(originalAmount) / parseFloat(exchangeRate);
            setTotalAmount(convertedAmount.toFixed(2));
        } else if (originalAmount) {
            setTotalAmount(parseFloat(originalAmount).toFixed(2));
        }
        else {
            const detailsTotal = expenseDetails.reduce((sum, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 0;
                return sum + (price * quantity);
            }, 0);
            setTotalAmount(detailsTotal.toFixed(2));
        }
    }, [originalAmount, exchangeRate, expenseDetails]);

    const handleArticleChange = async (selection, detail) => {
     
        if (!selection) {
            handleDetailChange(detail.id, { itemId: null, itemDescription: '' });
            return;
        }

        // CASO 2: El usuario escribe un nuevo artículo
        if (selection.__isNew__) {
            try {
                const formData = new FormData();
                formData.append('op', 'createInventoryItem');
                formData.append('itemName', selection.label);
                formData.append('subcategoryId', detail.subcategory);
                const response = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: formData });
                const result = await response.json();

                if (result.status === 'success') {
                    const newItem = { value: result.itemId, label: selection.label, id_subcategoria: detail.subcategory };
                    setInventoryItems(prevItems => [...prevItems, newItem]);


                    handleDetailChange(detail.id, { itemId: result.itemId, itemDescription: selection.label });

                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Artículo creado', showConfirmButton: false, timer: 2000 });
                } else { throw new Error(result.message); }
            } catch (error) {
                Swal.fire('Error', `No se pudo crear el artículo: ${error.message}`, 'error');
            }
        }

        else {
            handleDetailChange(detail.id, {
                itemId: selection.value,
                itemDescription: selection.label
            });
        }
    };

    const handleSaveFromModal = (fileData) => {
        if (modalState.fileType) {
            // fileData es { file: Archivo, fileName: 'nombre.pdf' }
            // Guardamos solo el objeto File en nuestro estado.
            setFiles(prev => ({ ...prev, [modalState.fileType]: fileData.file }));
        }
    };

    const handleDetailChange = (id, updates) => {
        setExpenseDetails(expenseDetails.map(detail => {
            if (detail.id === id) {
                const updatedDetail = { ...detail, ...updates };


                if (updates.hasOwnProperty('category') && updates.category !== detail.category) {
                    updatedDetail.subcategory = null;
                    updatedDetail.itemId = null;
                    updatedDetail.itemDescription = '';
                }
                if (updates.hasOwnProperty('subcategory') && updates.subcategory !== detail.subcategory) {
                    updatedDetail.itemId = null;
                    updatedDetail.itemDescription = '';
                }

                return updatedDetail;
            }
            return detail;
        }));
    };

    const handleAddDetail = () => {
        setExpenseDetails([...expenseDetails,
        {
            id: Date.now(),
            expenseType: null,
            category: null,
            subcategory: null,
            itemId: null,
            price: '',
            quantity: '1',
            itemDescription: ''
        }]);
    };

    const handleRemoveDetail = (id) => {
        setExpenseDetails(expenseDetails.filter(detail => detail.id !== id));
    };

    const handleSaveExpense = async (event) => {
        event.preventDefault();

        if (!country || !expenseDate || expenseDetails.length === 0) {
            Swal.fire('Campos incompletos', 'Asegúrate de seleccionar país, fecha y agregar al menos un detalle de gasto.', 'warning');
            return;
        }

        const apiFormData = new FormData();
        if (files.facturaPdf) {
            apiFormData.append('factura_pdf_file', files.facturaPdf);
        }
        if (files.ticketJpg) {
            apiFormData.append('ticket_jpg_file', files.ticketJpg);
        }

        const generalData = {
            fecha_gasto: expenseDate.toISOString().split('T')[0],
            pais: country.value,
            moneda: country.value === 'MX' ? 'MXN' : 'USD',
            monto_total: totalAmount,
            cantidad_original: originalAmount,
            tipo_cambio: exchangeRate,
        };
        apiFormData.append('generalData', JSON.stringify(generalData));


        const detailsData = expenseDetails.map(detail => {

            const description = detail.itemDescription || '';
            return {
                id_tipo_gasto: detail.expenseType,
                id_articulo: detail.itemId,
                descripcion_articulo: description,
                cantidad_articulo: detail.quantity,
                precio_unitario: detail.price,
                id_categoria_mantenimiento: detail.expenseType === ID_MANTENIMIENTO ? detail.category : null,
                id_subcategoria_mantenimiento: detail.expenseType === ID_MANTENIMIENTO ? detail.subcategory : null,
            };
        });

        apiFormData.append('detailsData', JSON.stringify(detailsData));
        console.log("Datos que se van a enviar:", detailsData);



        apiFormData.append('op', 'Alta');

        try {
            const response = await fetch(`${apiHost}/save_expense.php`, {
                method: 'POST',
                body: apiFormData,
            });
            const result = await response.json();
            if (result.status === 'success') {
                Swal.fire('¡Éxito!', 'Gasto guardado correctamente.', 'success');
                resetForm();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar el gasto: ${error.message}`, 'error');
        }
    };

 

    const countries = [{ value: 'MX', label: 'México' }, { value: 'US', label: 'Estados Unidos' }];

    const handleRemoveFile = (fileType) => {
        setFiles(prev => ({ ...prev, [fileType]: null }));
    };


    const getSubtotal = (price, quantity) => {
        if (price && quantity) {
            return (parseFloat(price) * parseInt(quantity)).toFixed(2);
        }
        return '0.00';
    };

    return (
        <div className="app-screen-container">
            <div className="app-screen-wrapper">
                <div className="app-container">
                    <span className="app-label">Nuevo Gasto</span>
                    <div className="main-content-flex">
                        <div className="additional-card">
                            <form className="card-container" onSubmit={handleSaveExpense}>
                                <div className="form-actions">
                                    <button type="button" className="cancel-button" onClick={resetForm}>Cancelar</button>
                                    <button type="submit" className="accept-button">Guardar Gasto</button>
                                </div>
                                <div className="form-section">
                                    <legend className="card-label">Datos Generales del Gasto</legend>
                                    <div className="input-columns">
                                        <div className="column">
                                            <label>País de gasto:</label>
                                            <Select
                                                value={country}
                                                onChange={setCountry}
                                                options={countries}
                                                styles={selectStyles}
                                                isClearable />
                                        </div>
                                        <div className="column">
                                            <label>Fecha de ticket:</label>
                                            <DatePicker
                                                selected={expenseDate}
                                                onChange={(date) => setExpenseDate(date)}
                                                className="form-input date-picker-full-width"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="column">
                                    <label>Monto Original:</label>
                                    <input
                                        type="number"
                                        placeholder="Monto del ticket"
                                        className="form-input"
                                        value={originalAmount}
                                        onChange={(e) => setOriginalAmount(e.target.value)}
                                    />
                                </div>
                                <div className="column">
                                    <label>Tipo de Cambio:</label>
                                    <input
                                        type="number"
                                        placeholder="Si aplica"
                                        className="form-input"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(e.target.value)}
                                    />
                                </div>
                                <div className="column">
                                    <label>Monto Total (Final):</label>
                                    <input
                                        type="text"
                                        placeholder="Total"
                                        className="form-input"
                                        value={`$${totalAmount}`}
                                        readOnly
                                    />
                                </div>


                                <div className="form-section">
                                    <legend className="card-label">Agregar Detalle al Gasto</legend>
                                    {expenseDetails.map((detail) => {
                                        console.log(
                                            `Comparando: typeof item.id_subcategoria (${typeof inventoryItems[0]?.id_subcategoria})`,
                                            `con typeof detail.subcategory (${typeof detail.subcategory})`
                                        );
                                        const filteredSubcategories = (subcategories || []).filter(sub => parseInt(sub.id_categoria) == parseInt(detail.category));

                                        // Lo mismo para los artículos.
                                        const filteredItems = (inventoryItems || []).filter(item =>
                                            parseInt(item.id_subcategoria) == parseInt(detail.subcategory)
                                        );

                                        return (
                                            <div key={detail.id} className="detail-item-container">
                                                <div className="input-columns">
                                                    <div className="column">
                                                        <label>Tipo de Gasto:</label>
                                                        <Select
                                                            options={expenseTypes}
                                                            isLoading={typesLoading}
                                                            value={expenseTypes.find(o => o.value === detail.expenseType)}
                                                            onChange={(selection) => handleDetailChange(detail.id, { expenseType: selection ? selection.value : null })}

                                                            styles={selectStyles}
                                                        />
                                                    </div>
                                                    <div className="column">
                                                        <label>Precio:</label>
                                                        <input
                                                            type="number"
                                                            value={detail.price}
                                                            onChange={(e) => handleDetailChange(detail.id, { price: e.target.value })}
                                                            className="form-input" /></div>
                                                    <div className="column">
                                                        <label>Cantidad:</label>
                                                        <input
                                                            type="number"
                                                            value={detail.quantity}
                                                            onChange={(e) => handleDetailChange(detail.id, { quantity: e.target.value })}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveDetail(detail.id)} className="remove-button">X</button>
                                                </div>
                                                {detail.expenseType === ID_MANTENIMIENTO && (
                                                    <div className="input-columns maintenance-fields">
                                                        <div className="column">
                                                            <label>Categoría:</label>
                                                            <Select
                                                                options={maintenanceCategories}
                                                                isLoading={categoriesLoading}
                                                                value={maintenanceCategories.find(o => o.value === detail.category)}
                                                                onChange={(selection) => handleDetailChange(detail.id, { category: selection ? selection.value : null })}

                                                                styles={selectStyles} /></div>
                                                        <div className="column">
                                                            <label>Subcategoría:</label>
                                                            <Select
                                                                options={filteredSubcategories}
                                                                isLoading={subcategoriesLoading}
                                                                value={filteredSubcategories.find(o => o.value === detail.subcategory)}
                                                                onChange={(selection) => handleDetailChange(detail.id, { subcategory: selection ? selection.value : null })}
                                                                isDisabled={!detail.category} styles={selectStyles}
                                                            />
                                                        </div>
                                                        <div className="column"><label>Artículo:</label>
                                                            <CreatableSelect
                                                                options={filteredItems}
                                                                isLoading={itemsLoading}
                                                                value={
                                                                    detail.itemDescription
                                                                        ? { value: detail.itemId, label: detail.itemDescription }
                                                                        : null
                                                                }


                                                                onChange={(selection) => handleArticleChange(selection, detail)}

                                                                isDisabled={!detail.subcategory}
                                                                isClearable
                                                                placeholder="Selecciona o escribe un artículo..."
                                                                styles={selectStyles}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <button type="button" onClick={handleAddDetail} className="add-detail-button">+ Agregar Item</button>
                                </div>

                                <div className="form-section">
                                    <legend className="card-label">Documentos (Facturas/Tickets)</legend>
                                    <div className="input-columns">
                                        {/* Botón para PDF */}
                                        <div className="column">
                                            <label>Factura (PDF)</label>
                                            {!files.facturaPdf ? (
                                                <button type="button" className="upload-button" onClick={() => setModalState({ isOpen: true, fileType: 'facturaPdf' })}>
                                                    Adjuntar PDF
                                                </button>
                                            ) : (
                                                <div className="file-display">
                                                    <span className="file-icon">📄</span>
                                                    <p className="file-name-display">{files.facturaPdf.name}</p>
                                                    <button type="button" className="remove-file-button" onClick={() => handleRemoveFile('facturaPdf')}>X</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Input para Ticket (Imagen) */}
                                        <div className="column">
                                            <label>Ticket (JPG/PNG)</label>
                                            {!files.ticketJpg ? (
                                                <button type="button" className="upload-button" onClick={() => setModalState({ isOpen: true, fileType: 'ticketJpg' })}>
                                                    Adjuntar Imagen
                                                </button>
                                            ) : (
                                                <div className="file-display">
                                                    <span className="file-icon">🖼️</span>
                                                    <p className="file-name-display">{files.ticketJpg.name}</p>
                                                    <button type="button" className="remove-file-button" onClick={() => handleRemoveFile('ticketJpg')}>X</button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </form>
                            <ModalArchivo
                                isOpen={modalState.isOpen}
                                onClose={() => setModalState({ isOpen: false, fileType: null })}
                                onSave={handleSaveFromModal}
                                title={modalState.fileType === 'facturaPdf' ? 'Adjuntar Factura PDF' : 'Adjuntar Ticket de Gasto'}
                                saveButtonText="Seleccionar Archivo"
                                accept={modalState.fileType === 'facturaPdf' ? 'application/pdf' : 'image/jpeg,image/png'}
                                mostrarFechaVencimiento={false}
                            />
                        </div>
                        <div className="previsualizador-card">
                            <h3 className="preview-title">Resumen del Gasto</h3>
                            <div className="preview-general-info">
                                <p><strong>País:</strong> {country?.label || 'N/A'}</p>
                                <p><strong>Fecha:</strong> {expenseDate ? expenseDate.toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Monto Total:</strong> ${totalAmount}</p>
                            </div>
                            <h4 className="preview-subtitle">Detalles:</h4>
                            <ul className="preview-details-list">
                                {expenseDetails.map((detail) => {

                                    const typeLabel = expenseTypes.find(t => t.value === detail.expenseType)?.label || 'N/A';
                                    const categoryLabel = maintenanceCategories.find(c => c.value === detail.category)?.label || 'N/A';
                                    const subcategoryLabel = subcategories.find(s => s.value === detail.subcategory)?.label || 'N/A';
                                    const itemLabel = detail.itemDescription || 'N/A';

                                    const isMaintenance = typeLabel === 'Mantenimiento';

                                    return (
                                        <li key={detail.id} className="preview-detail-item">
                                            <p><strong>Tipo:</strong> {typeLabel}</p>
                                            {isMaintenance && (
                                                <p className="preview-maintenance-info">
                                                    <strong>Categoría:</strong> {categoryLabel}<br />
                                                    <strong>Subcategoría:</strong> {subcategoryLabel}<br />
                                                    <strong>Artículo:</strong> {itemLabel}
                                                </p>
                                            )}

                                            <p>
                                                <strong>Cantidad:</strong> {detail.quantity || 0} x
                                                <strong> Precio:</strong> ${parseFloat(detail.price || 0).toFixed(2)} =
                                                <strong> Subtotal:</strong> ${getSubtotal(detail.price, detail.quantity)}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                            <h4 className="preview-subtitle">Documentos:</h4>
                            <ul className="preview-documents-list">
                                {files.facturaPdf && <li>{files.facturaPdf.name}</li>}
                                {files.ticketJpg && <li>{files.ticketJpg.name}</li>}
                                {!files.facturaPdf && !files.ticketJpg && <li>No hay documentos adjuntos.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseScreen;