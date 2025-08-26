import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';

import useFetchInventoryItems from '../hooks/expense_hooks/useFetchInventoryItems';
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


    const handleAddItem = (tipo) => {
        if (!itemSeleccionado) {
            alert('Por favor, selecciona un artículo.');
            return;
        }

        const nuevoDetalle = {
            id: Date.now(),
            id_articulo: itemSeleccionado.value,
            tipo_detalle: tipo,
            descripcion: itemSeleccionado.label,
            cantidad: cantidad,
        };

        setDetalles([...detalles, nuevoDetalle]);
        setItemSeleccionado(null);
        setCantidad(1);
    };

    const handleSaveOrder = async () => {

        const ordenData = {
            fecha: fecha.toISOString().split('T')[0],
            tipo_mantenimiento: tipoMantenimiento.value,
            tipo_reparacion: tipoReparacion.value,
            truck_id: selectedTruck.value,
            tipo_cambio: tipoCambio,
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
                    <Select
                        options={[{ value: 'Motor', label: 'Motor' }, { value: 'Sistema de frenos', label: 'Sistema de frenos' }]}
                        value={tipoReparacion}
                        onChange={setTipoReparacion}
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

            {/* --- SECCIÓN DE DETALLES AGREGADOS --- */}
            <div className="full-width">
                <h3>Artículos en la Orden</h3>
                <table className="details-table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            {mode !== 'view' && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {detalles.length > 0 ? (
                            detalles.map(d => (
                                <tr key={d.id || d.id_detalle}>
                                    <td>{d.tipo_detalle}</td>
                                    <td>{d.descripcion}</td>
                                    <td>{d.cantidad}</td>
                                    {mode !== 'view' && (
                                        <td>
                                            <button className="remove-button" onClick={() => handleRemoveDetail(d.id || d.id_detalle)}>Quitar</button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={mode !== 'view' ? 4 : 3}>Aún no se han agregado artículos a la orden.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {mode !== 'view' && (
                <button className="action-button save-order-button full-width" onClick={handleSaveOrder}>
                    {mode === 'create' ? 'Guardar Orden de Servicio' : 'Actualizar Orden'}
                </button>
            )}
        </div>
    );
};

export default ServiceOrderScreen;