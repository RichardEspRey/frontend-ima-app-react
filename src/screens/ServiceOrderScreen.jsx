import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import CreatableSelect from 'react-select/creatable'; 

import { useParams, useNavigate } from 'react-router-dom';

import useFetchInventoryItems from '../hooks/expense_hooks/useFetchInventoryItems';
import useFetchRepairTypes from '../hooks/service_order/useFetchRepairTypes'; 

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/ServiceOrderScreen.css';
const apiHost = import.meta.env.VITE_API_HOST;

const useFetchTrucks = () => {
    const [trucks, setTrucks] = useState([]);
    useEffect(() => {
        const fetchTrucks = async () => {
            const formData = new FormData();
            formData.append('op', 'getTrucks');
            try {
                const response = await fetch(`${apiHost}/service_order.php`, { method: 'POST', body: formData });
                const result = await response.json();
                if (result.status === 'success') setTrucks(result.data);
            } catch (error) { console.error("Error fetching trucks:", error); }
        };
        fetchTrucks();
    }, []);
    return { trucks };
};


const ServiceOrderScreen = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [mode, setMode] = useState(orderId ? 'loading' : 'create');
    // Al inicio de tu componente ServiceOrderScreen
    const [costoManoObra, setCostoManoObra] = useState('');

    const [tipoMantenimiento, setTipoMantenimiento] = useState(null);
    const [tipoReparacion, setTipoReparacion] = useState(null);
    const [fecha, setFecha] = useState(new Date());
    const [selectedTruck, setSelectedTruck] = useState(null);
    const [tipoCambio, setTipoCambio] = useState('');

    const [detalles, setDetalles] = useState([]);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState(1);

    const { inventoryItems, loading: itemsLoading } = useFetchInventoryItems();
    const { trucks } = useFetchTrucks();
    const { repairTypes, loadingRepairTypes, refetchRepairTypes } = useFetchRepairTypes();

    const handleCreateRepairType = async (inputValue) => {
    Swal.fire({
        title: `Creando "${inputValue}"...`,
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false
    });

    const formData = new FormData();
    formData.append('op', 'createRepairType');
    formData.append('nombre_reparacion', inputValue);

    try {
        const response = await fetch(`${apiHost}/service_order.php`, { method: 'POST', body: formData });
        const result = await response.json();

        if (result.status === 'success') {
            await refetchRepairTypes(); 
            setTipoReparacion(result.data);

            
            Swal.fire({
                icon: 'success',
                title: '¡Creado!',
                text: `"${inputValue}" ha sido añadido a la lista.`,
                showConfirmButton: false, // No necesitamos un botón de OK
                timer: 1500 // Se cerrará automáticamente después de 1.5 segundos
            });
            // =========================

        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
};
    useEffect(() => {
        if (orderId) {
            const fetchOrderData = async () => {
                const formData = new FormData();
                formData.append('op', 'getOrderById');
                formData.append('id_orden', orderId);

                try {
                    const response = await fetch(`${apiHost}/service_order.php`, { method: 'POST', body: formData });
                    const result = await response.json();

                    if (result.status === 'success') {
                        const { orden, detalles } = result.data;

                        setFecha(new Date(orden.fecha_orden));
                        setSelectedTruck({ value: orden.truck_id, label: orden.nombre_camion });
                        setTipoMantenimiento({ value: orden.tipo_mantenimiento, label: orden.tipo_mantenimiento });
                        setTipoReparacion({ value: orden.tipo_reparacion, label: orden.tipo_reparacion });
                        setTipoCambio(orden.tipo_cambio || '');
                        setCostoManoObra(orden.costo_mano_obra || '');
                        setDetalles(detalles.map(d => ({ ...d, id: d.id_detalle })));

                        if (orden.estatus === 'Completado' || orden.estatus === 'Cancelado') {
                            setMode('view');
                        } else {
                            setMode('edit');
                        }
                    } else { throw new Error(result.message); }
                } catch (error) {
                    Swal.fire('Error', 'No se pudieron cargar los datos de la orden.', 'error');
                    navigate('/admin-service-order');
                }
            };
            fetchOrderData();
        }
    }, [orderId, navigate]);

    const totalRefacciones = useMemo(() => {
        return detalles.reduce((total, item) => {
            const costo = parseFloat(item.costo_unitario_registrado || item.costo_unidad || 0);
            const cantidadItem = parseInt(item.cantidad || 1);
            return total + (costo * cantidadItem);
        }, 0);
    }, [detalles]);

    const totalGeneral = useMemo(() => {
        const manoDeObra = parseFloat(costoManoObra) || 0;
        return totalRefacciones + manoDeObra;
    }, [totalRefacciones, costoManoObra]);



    const handleAddItem = (tipo) => {
        if (!itemSeleccionado) {
            Swal.fire('Atención', 'Por favor, selecciona un artículo.', 'warning');
            return;
        }
        // if (itemSeleccionado.costo_unidad === undefined || itemSeleccionado.costo_unidad === null) {
        //     Swal.fire('Error', 'El artículo seleccionado no tiene un costo de inventario válido.', 'error');
        //     return;
        // }


        const nuevoDetalle = {
            id: Date.now(),
            id_articulo: itemSeleccionado.value,
            tipo_detalle: tipo,
            descripcion: itemSeleccionado.label,
            cantidad: cantidad,
            costo_unidad: itemSeleccionado.costo_unidad,
        };

        setDetalles([...detalles, nuevoDetalle]);
        setItemSeleccionado(null);
        setCantidad(1);
    };

    const handleRemoveDetail = (idToRemove) => {
        setDetalles(detalles.filter(d => (d.id || d.id_detalle) !== idToRemove));
    };

    const handleSaveOrder = async () => {

        const ordenData = {
            fecha: fecha.toISOString().split('T')[0],
            tipo_mantenimiento: tipoMantenimiento.value,
            tipo_reparacion: tipoReparacion.value,
            truck_id: selectedTruck.value,
            tipo_cambio: tipoCambio,
            costo_mano_obra: costoManoObra
        };
        const detallesData = detalles;

        const formData = new FormData();
        const op = mode === 'create' ? 'AltaOrden' : 'UpdateOrder';
        formData.append('op', op);
        if (mode === 'edit') {
            formData.append('id_orden', orderId);
        }
        formData.append('ordenData', JSON.stringify(ordenData));
        formData.append('detallesData', JSON.stringify(detallesData));

        try {
            const response = await fetch(`${apiHost}/service_order.php`, {
                method: 'POST', body: formData
            });
            const result = await response.json();

            if (result.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `Orden ${mode === 'create' ? 'guardada' : 'actualizada'} correctamente.`
                });
                navigate('/admin-service-order');

            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    if (mode === 'loading') {
        return <h2>Cargando Orden de Servicio...</h2>;
    }

    return (
        <div className="service-order-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Volver
            </button>
            <h1>
                {mode === 'create' && 'Nueva Orden de Servicio'}
                {mode === 'edit' && `Editando Orden de Servicio #${orderId}`}
                {mode === 'view' && `Viendo Orden de Servicio #${orderId}`}
            </h1>

            <div className="form-grid">
                <div className="form-group">
                    <label>Camión:</label>
                    <Select
                        options={trucks}
                        value={selectedTruck}
                        onChange={setSelectedTruck}
                        placeholder="Selecciona un camión..."
                        isClearable
                        isDisabled={mode == 'view'} />
                </div>
                <div className="form-group">
                    <label>Tipo de mantenimiento:</label>
                    <Select
                        options={[{ value: 'Correctivo', label: 'Correctivo' }, { value: 'Preventivo', label: 'Preventivo' }]}
                        value={tipoMantenimiento}
                        onChange={setTipoMantenimiento}
                        isDisabled={mode == 'view'}
                    />
                </div>

                <div className="form-group">
                    <label>Tipo de reparación:</label>
                    <CreatableSelect
                        isClearable
                        isDisabled={mode === 'view' || loadingRepairTypes}
                        isLoading={loadingRepairTypes}
                        onChange={setTipoReparacion}
                        onCreateOption={handleCreateRepairType}
                        options={repairTypes}
                        value={tipoReparacion}
                        placeholder="Selecciona o escribe para crear..."
                        formatCreateLabel={inputValue => `Crear nuevo: "${inputValue}"`}
                    />
                </div>

                <div className="form-group">
                    <label>Fecha de la orden:</label>
                    <DatePicker
                        selected={fecha}
                        onChange={(date) => setFecha(date)}
                        className="form-input date-picker-full-width"
                    />
                </div>

                <div className="form-group">
                    <label>Tipo de cambio (si aplica):</label>
                    <input
                        type="number"
                        placeholder="Ej: 17.50"
                        className="form-input"
                        value={tipoCambio}
                        onChange={(e) => setTipoCambio(e.target.value)}
                        disabled={mode === 'view'}
                    />
                </div>

                <div className="form-group">
                    <label>Costo de Mano de Obra:</label>
                    <input
                        type="number"
                        placeholder="Ej: 500.00"
                        className="form-input"
                        value={costoManoObra}
                        onChange={(e) => setCostoManoObra(e.target.value)}
                        disabled={mode === 'view'}
                    />
                </div>
            </div>


            {mode !== 'view' && (
                <>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Consumibles y Refacciones:</label>
                            <Select
                                options={inventoryItems}
                                value={itemSeleccionado}
                                onChange={setItemSeleccionado}
                                isLoading={itemsLoading}
                                placeholder="Busca un artículo del inventario..."
                                isClearable
                            />
                        </div>
                        <div className="form-group">
                            <label>Cantidad:</label>
                            <input
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                min="1"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Agregar como:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="action-button"
                                    onClick={() => handleAddItem('Consumible')}>Consumible</button>
                                <button
                                    type="button"
                                    className="action-button"
                                    onClick={() => handleAddItem('Refaccion')}>Refacción</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <br />
            {/* --- SECCIÓN DE DETALLES AGREGADOS --- */}
            <div className="full-width">
                <h3>Artículos en la Orden</h3>
                <table className="details-table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Costo Unitario</th>
                            <th>Subtotal</th>
                            {mode !== 'view' && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {detalles.length > 0 ? (
                            detalles.map(d => {
                                // La "caja" lee la info del "carrito" (d)
                                const costo = parseFloat(d.costo_unitario_registrado || d.costo_unidad || 0);
                                const cantidadItem = parseInt(d.cantidad || 1);
                                const subtotal = costo * cantidadItem;

                                return (
                                    <tr key={d.id || d.id_detalle}>
                                        <td>{d.tipo_detalle}</td>
                                        <td>{d.descripcion}</td>
                                        <td>{cantidadItem}</td>

                                        {/* Y aquí "imprime" el costo y subtotal en el ticket */}
                                        <td>${costo.toFixed(2)}</td>
                                        <td>${subtotal.toFixed(2)}</td>

                                        {mode !== 'view' && (
                                            <td>
                                                <button className="remove-button" onClick={() => handleRemoveDetail(d.id || d.id_detalle)}>Quitar</button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={mode !== 'view' ? 4 : 3}>Aún no se han agregado artículos a la orden.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <br />
            <div className="order-total">
                <div className="total-line">
                    <span className="total-label">Subtotal Refacciones:</span>
                    <span className="total-value">${totalRefacciones.toFixed(2)}</span>
                </div>
                <div className="total-line">
                    <span className="total-label">Mano de Obra:</span>
                    <span className="total-value">${(parseFloat(costoManoObra) || 0).toFixed(2)}</span>
                </div>
                <div className="total-line grand-total">
                    <span className="total-label">Total General:</span>
                    <span className="total-value">${totalGeneral.toFixed(2)}</span>
                </div>
            </div>
            <br />
            {mode !== 'view' && (
                <button className="action-button save-order-button full-width" onClick={handleSaveOrder}>
                    {mode === 'create' ? 'Guardar Orden de Servicio' : 'Actualizar Orden'}
                </button>
            )}


        </div>
    );
};

export default ServiceOrderScreen;