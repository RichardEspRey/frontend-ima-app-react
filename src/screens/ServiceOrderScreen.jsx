import React, { useMemo, useRef, useState } from "react";
import styles from "../screens/css/Orden.module.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import useFetchInventoryItems from "../hooks/expense_hooks/useFetchInventoryItems";
import useFetchRepairTypes from "../hooks/service_order/useFetchRepairTypes";

const apiHost = import.meta.env.VITE_API_HOST;

/* === Trucks === */
const useFetchTrucks = () => {
    const [trucks, setTrucks] = React.useState([]);
    React.useEffect(() => {
        const fetchTrucks = async () => {
            const formData = new FormData();
            formData.append("op", "getTrucks");
            try {
                const res = await fetch(`${apiHost}/service_order.php`, {
                    method: "POST",
                    body: formData,
                });
                const json = await res.json();
                if (json.status === "success") setTrucks(json.data || []);
            } catch (e) {
                console.error("Error fetching trucks:", e);
            }
        };
        fetchTrucks();
    }, []);
    return { trucks };
};

/* === Money fmt === */
const money = (v) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(
        Number(v || 0)
    );

export default function ServiceOrderScreen() {
    const navigate = useNavigate();

    // ---------- Datos remotos ----------
    const { trucks } = useFetchTrucks();
    const { inventoryItems, loading: itemsLoading } = useFetchInventoryItems();
    const { repairTypes, loadingRepairTypes, refetchRepairTypes } = useFetchRepairTypes();
    const [itemSeleccionado, setItemSeleccionado] = useState(null); // {value,label,costo_unidad}
    const [cant, setCant] = useState(1);
    const [pendItems, setPendItems] = useState([]);

    const stockSelected = useMemo(
        () => Number(itemSeleccionado?.cantidad_stock || 0),
        [itemSeleccionado]
    );

    const handleCantidadChange = (e) => {
        const raw = e.target.value;
        // permitir borrar el campo
        if (raw === "") { setCant(""); return; }

        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) { setCant(""); return; }

        if (stockSelected && n > stockSelected) {
            Swal.fire({
                icon: "warning",
                title: "Cantidad excedida",
                text: "No se puede colocar una cantidad mayor a la disponible en stock",
            });
            setCant(""); // limpiar input
            return;
        }
        setCant(n);
    };

    const onChangeItem = (opt) => {
        setItemSeleccionado(opt);
        setCant(""); // reset cantidad al cambiar de artículo
    };


    // Mapea trucks a react-select (tolerante a diferentes llaves)
    const truckOptions = useMemo(
        () =>
            (trucks || []).map((t) => ({
                value: t.value ?? t.id ?? t.truck_id ?? String(t.unidad ?? t.nombre ?? t.id),
                label:
                    t.label ??
                    t.unidad ??
                    t.nombre ??
                    String(t.value ?? t.id ?? t.truck_id ?? ""),
            })),
        [trucks]
    );

    // Mapea inventario a react-select con costo_unidad numérico
    const invOptions = useMemo(
        () =>
            (inventoryItems || []).map((it) => ({
                value: it.value ?? it.id ?? it.item_id,
                label: it.label ?? it.nombre ?? it.descripcion ?? "",
                costo_unidad: parseFloat(it.costo_unidad ?? it.costoUnitario ?? 0) || 0,
                cantidad_stock: parseInt(it.cantidad_stock ?? it.stock ?? 0, 10) || 0,
                id_subcategoria: it.id_subcategoria ?? null,
            })),
        [inventoryItems]
    );


    // ---------- Orden (encabezado) ----------
    const [selectedTruck, setSelectedTruck] = useState(null); // react-select option
    const [dateForm, setDateForm] = useState(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [orden, setOrden] = useState({ truck: null, fecha: null });
    const [tipoCambioOrden, setTipoCambioOrden] = useState("");
    const seleccionarOrden = () => {
        if (!selectedTruck?.value || !dateForm) {
            alert("Selecciona camión y fecha");
            return;
        }
        setOrden({ truck: String(selectedTruck.value), fecha: dateForm });
    };

    // ---------- Constructor de servicio ----------
    const [tipoMantenimiento, setTipoMantenimiento] = useState(null); // {value,label}
    const [tipoReparacion, setTipoReparacion] = useState(null); // {value,label} (creatable)
    const [svc, setSvc] = useState({
        tipoCambio: "",
        costoMO: "",
        usarItems: false,
    });

    // Items del servicio en construcción


    const addItemToPending = (tipo /* 'consumible' | 'refaccion' */) => {
        if (!svc.usarItems) return;
        const cantidad = Number(cant);
        if (!itemSeleccionado?.value || !cantidad || cantidad <= 0) {
            Swal.fire({ icon: "warning", title: "Falta información", text: "Selecciona un artículo y una cantidad válida." });
            return;
        }
        const costoUnitario = Number(itemSeleccionado.costo_unidad || 0);

        // 🔒 Validar contra stock
        const stock = Number(itemSeleccionado.cantidad_stock || 0);
        if (stock && cantidad > stock) {
            Swal.fire({
                icon: "warning",
                title: "Cantidad excedida",
                text: "No se puede colocar una cantidad mayor a la disponible en stock",
            });
            setCant("");
            return;
        }

        const nuevo = {
            uid: Date.now().toString() + Math.random(),
            inventarioId: String(itemSeleccionado.value),
            descripcion: itemSeleccionado.label,
            tipo, // 'consumible' | 'refaccion'
            cantidad,
            costoUnitario,
            subtotal: cantidad * costoUnitario,
        };
        setPendItems((prev) => [...prev, nuevo]);
    };


    const removePendingItem = (uid) =>
        setPendItems((prev) => prev.filter((i) => i.uid !== uid));

    // ---------- Lista de servicios agregados ----------
    const seq = useRef(1);
    const [services, setServices] = useState([]); // [{id, mantenimiento:{value,label}, reparacion:{value,label}, tipoCambio, costoMO, items:[] }]

    const agregarServicio = () => {
        if (!orden.truck || !orden.fecha) {
            alert("Primero selecciona camión y fecha de la orden.");
            return;
        }
        if (!tipoMantenimiento?.value || !tipoReparacion?.value) {
            alert("Selecciona tipo de mantenimiento y tipo de reparación.");
            return;
        }
        if (svc.usarItems && pendItems.length === 0) {
            alert("Activaste refacciones/consumibles: agrega al menos un artículo.");
            return;
        }

        const nuevo = {
            id: seq.current++,
            mantenimiento: {
                value: tipoMantenimiento.value,
                label: tipoMantenimiento.label,
            },
            reparacion: {
                value: tipoReparacion.value,
                label: tipoReparacion.label,
            },
            tipoCambio: svc.tipoCambio || "",
            costoMO: Number(svc.costoMO || 0),
            items: svc.usarItems ? [...pendItems] : [],
        };

        setServices((prev) => [...prev, nuevo]);

        // Reset builder de servicio
        setTipoMantenimiento(null);
        setTipoReparacion(null);
        setSvc({ tipoCambio: "", costoMO: "", usarItems: false });
        setPendItems([]);
        setItemSeleccionado(null);
        setCant(1);
    };

    const quitarServicio = (id) =>
        setServices((prev) => prev.filter((s) => s.id !== id));

    // ---------- Totales (de toda la orden) ----------
    const subtotalItems = useMemo(
        () =>
            services.reduce(
                (acc, s) => acc + s.items.reduce((a, i) => a + i.subtotal, 0),
                0
            ),
        [services]
    );
    const totalMO = useMemo(
        () => services.reduce((a, s) => a + Number(s.costoMO || 0), 0),
        [services]
    );
    const totalGeneral = subtotalItems + totalMO;

    // ---------- Guardar orden ----------
    // arriba, con tus otros states:
    const [saving, setSaving] = useState(false);

    // ---------- Guardar orden ----------
    const enviarOrden = async () => {
        if (!orden.truck || !orden.fecha || services.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Faltan datos",
                text: "Selecciona camión/fecha y agrega al menos un servicio.",
            });
            return;
        }
    const tipoCambioNum = tipoCambioOrden === "" ? null : Number(tipoCambioOrden);
        // Construir payload que tu API 'AltaOrden' espera
        const payload = {
            truck_id: orden.truck,
            fecha: orden.fecha,
            tipo_cambio: tipoCambioNum,
            servicios: services.map((s) => ({
                // tu backend usa label si está, o id; le mandamos ambos formatos seguros
                tipo_mantenimiento_label: s.mantenimiento?.label ?? String(s.mantenimiento?.value ?? ""),
                tipo_reparacion_label: s.reparacion?.label ?? String(s.reparacion?.value ?? ""),
                tipo_cambio: s.tipoCambio || null,
                costo_mano_obra: Number(s.costoMO || 0),
                items: (s.items || []).map((i) => ({
                    item_id: i.inventarioId,
                    tipo: i.tipo, // 'consumible' | 'refaccion'
                    cantidad: Number(i.cantidad),
                    costo_unitario: Number(i.costoUnitario || 0),
                })),
            })),
        };

        const form = new FormData();
        form.append("op", "AltaOrden"); 
        form.append("truck_id", payload.truck_id);
        form.append("fecha", payload.fecha);
        form.append("tipo_cambio", payload.tipo_cambio != null ? String(payload.tipo_cambio) : "");
        form.append("servicios", JSON.stringify(payload.servicios));

        try {
            setSaving(true);
            Swal.fire({
                title: "Guardando orden...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await fetch(`${apiHost}/service_order.php`, {
                method: "POST",
                body: form,
            });

            const json = await res.json().catch(() => null);

            if (!res.ok || !json || json.status !== "success") {
                const msg =
                    (json && json.message) ||
                    `Error HTTP ${res.status} al guardar la orden.`;
                throw new Error(msg);
            }

            Swal.fire({
                icon: "success",
                title: "Orden creada",
                text: `ID de la orden: ${json.id_orden}`,
            });

            // (Opcional) limpiar estados del formulario
            setOrden({ truck: null, fecha: null });
            setSelectedTruck(null);
            setServices([]);
            setPendItems([]);
            setItemSeleccionado(null);
            setCant(1);
            setSvc({ tipoCambio: "", costoMO: "", usarItems: false });
            setTipoMantenimiento(null);
            setTipoReparacion(null);
            setTipoCambioOrden("");

            navigate('/admin-service-order');
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: String(e.message || e),
            });
        } finally {
            setSaving(false);
        }
    };


    //Crear nuevo tipo de reparacion
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

    return (
        <div className={styles.column2}>
            <h1 className={styles.title}>Orden de Servicio</h1>

            <div className="grid grid-cols-12 gap-5 max-w-7xl mx-auto">
                {/* Columna izquierda */}
                <div className={styles.titulos}>
                    {/* Datos generales */}
                    <div className="bg-white rounded-2xl shadow p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold">Datos Generales de la Orden</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <p className="text-sm text-gray-500 mt-3 md:col-span-2">
                                Seleccionados: <strong>Camión {orden.truck || "N/A"}</strong> —{" "}
                                <strong>Fecha: {orden.fecha || "sin fecha"}</strong>
                            </p>

                            <div className={styles.column}>
                                <label className="block text-sm font-medium mb-1">Camión</label>
                                <Select
                                    options={truckOptions}
                                    value={selectedTruck}
                                    onChange={setSelectedTruck}
                                    placeholder="Selecciona un camión..."
                                    isClearable
                                />
                            </div>

                            <div className={styles.column}>
                                <label className="block text-sm font-medium mb-1">Fecha</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={dateForm}
                                    onChange={(e) => setDateForm(e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={seleccionarOrden}
                                >
                                    Seleccionar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form de servicio */}
                    <div className="bg-white rounded-2xl shadow p-4">
                        <h3 className="text-base font-semibold mb-3">Agregar Detalle de Servicio</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className={styles.column}>
                                <label className="block text-sm font-medium mb-1">
                                    Tipo de Mantenimiento
                                </label>
                                <Select
                                    options={[
                                        { value: "Correctivo", label: "Correctivo" },
                                        { value: "Preventivo", label: "Preventivo" },
                                    ]}
                                    value={tipoMantenimiento}
                                    onChange={setTipoMantenimiento}
                                    placeholder="Selecciona..."
                                />
                            </div>

                            <div className={styles.column}>
                                <label className="block text-sm font-medium mb-1">
                                    Tipo de Reparación
                                </label>
                                <CreatableSelect
                                    isClearable
                                    onChange={setTipoReparacion}
                                    onCreateOption={handleCreateRepairType}
                                    options={repairTypes}
                                    value={tipoReparacion}
                                    placeholder="Selecciona o escribe para crear..."
                                    formatCreateLabel={(v) => `Crear nuevo: "${v}"`}
                                />
                            </div>

                            <div className={styles.column}>
                                <label className="block text-sm font-medium mb-1">
                                    Tipo de Cambio (si aplica)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    className={styles.input}
                                    placeholder="0.00"
                                    value={tipoCambioOrden}
                                    onChange={(e) => setTipoCambioOrden(e.target.value)}
                                />
                            </div>

                            <div className={styles.column}>
                                <label className="block text-sm font-medium mb-1">
                                    Costo de Mano de Obra
                                </label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    placeholder="0"
                                    value={svc.costoMO}
                                    onChange={(e) => setSvc((s) => ({ ...s, costoMO: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    className={styles.check}
                                    type="checkbox"
                                    checked={svc.usarItems}
                                    onChange={(e) =>
                                        setSvc((s) => ({ ...s, usarItems: e.target.checked }))
                                    }
                                />
                                <span className={styles.span}>¿Utiliza refacción/consumible?</span>
                            </label>
                        </div>

                        {svc.usarItems && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Artículo (inventario)</label>
                                    <Select
                                        options={invOptions}
                                        value={itemSeleccionado}
                                        onChange={onChangeItem}
                                        isLoading={itemsLoading}
                                        placeholder="Busca un artículo del inventario..."
                                        isClearable
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock disponible</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={stockSelected}
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={stockSelected || undefined}
                                        className={styles.input}
                                        value={cant}
                                        onChange={handleCantidadChange}
                                        disabled={!itemSeleccionado || stockSelected <= 0}
                                        placeholder={itemSeleccionado ? "Cantidad" : "Selecciona un artículo primero"}
                                    />
                                </div>

                                <div className="md:col-span-3 flex items-end gap-2">
                                    <button
                                        className="flex-1 px-3 py-2 rounded-xl border hover:bg-gray-50"
                                        onClick={() => addItemToPending("consumible")}
                                        disabled={!itemSeleccionado || !cant}
                                    >
                                        Agregar como Consumible
                                    </button>
                                    <button
                                        className={styles.butonAdd}
                                        onClick={() => addItemToPending("refaccion")}
                                        disabled={!itemSeleccionado || !cant}
                                    >
                                        Agregar como Refacción
                                    </button>
                                </div>
                            </div>
                        )}


                        {svc.usarItems && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Items agregados a este servicio</h4>
                                {pendItems.length === 0 ? (
                                    <p className="text-sm text-gray-500">Aún no hay artículos.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="text-left border-b">
                                                    <th className="py-2 pr-2">Tipo</th>
                                                    <th className="py-2 pr-2">Descripción</th>
                                                    <th className="py-2 pr-2 text-center">Cant.</th>
                                                    <th className="py-2 pr-2 text-right">Costo</th>
                                                    <th className="py-2 pr-2 text-right">Subtotal</th>
                                                    <th className="py-2 pr-2">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendItems.map((it) => (
                                                    <tr key={it.uid} className="border-b last:border-b-0">
                                                        <td className="py-2 pr-2">{it.tipo}</td>
                                                        <td className="py-2 pr-2">{it.descripcion}</td>
                                                        <td className="py-2 pr-2 text-center">{it.cantidad}</td>
                                                        <td className="py-2 pr-2 text-right">
                                                            {money(it.costoUnitario)}
                                                        </td>
                                                        <td className="py-2 pr-2 text-right">
                                                            {money(it.subtotal)}
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <button
                                                                className="text-red-600 hover:underline"
                                                                onClick={() => removePendingItem(it.uid)}
                                                            >
                                                                Quitar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <button
                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={agregarServicio}
                            >
                                Agregar servicio
                            </button>
                        </div>
                    </div>
                </div>

                {/* Columna derecha: Resumen & servicios */}
                <div className="col-span-12 lg:col-span-4 space-y-5">
                    <div className={styles.contenido}>
                        <h3 className="text-lg font-semibold mb-2">Resumen de la Orden</h3>
                        <div className="text-sm space-y-1">
                            <div>
                                <span className="font-medium">Camión:</span>{" "}
                                {orden.truck || "N/A"}
                            </div>
                            <div>
                                <span className="font-medium">Fecha:</span>{" "}
                                {orden.fecha || "—"}
                            </div>
                            <div>
                                <span className="font-medium">Total:</span>{" "}
                                {money(totalGeneral)}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Servicios agregados</h3>
                        {services.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay servicios.</p>
                        ) : (
                            <div className="space-y-3">
                                {services.map((s, idx) => (
                                    <div key={s.id} className={styles.contenido}>
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <div>
                                                <div className="font-bold">Servicio {idx + 1}</div>
                                                <div className="text-sm text-gray-600">
                                                    {s.mantenimiento.label} / {s.reparacion.label}
                                                </div>
                                            </div>
                                            <button
                                                className="text-red-600 text-sm hover:underline"
                                                onClick={() => quitarServicio(s.id)}
                                            >
                                                Quitar
                                            </button>
                                        </div>

                                        <div className="text-sm">
                                            <div>
                                                <span className="font-medium">MO:</span>{" "}
                                                {money(s.costoMO)}
                                            </div>
                                        </div>

                                        {s.items.length > 0 && (
                                            <div className="mt-2 text-sm">
                                                <div className="font-medium mb-1">Items:</div>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {s.items.map((i) => (
                                                        <li key={i.uid}>
                                                            <span className="uppercase text-xs tracking-wide bg-gray-100 px-2 py-0.5 rounded mr-2">
                                                                {i.tipo}
                                                            </span>
                                                            {i.descripcion} × {i.cantidad} — {money(i.subtotal)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <hr className="my-3" />
                        <div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal Refacciones:</span>
                                <span className="font-semibold">{money(subtotalItems)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-600">Mano de Obra:</span>
                                <span className="font-semibold">{money(totalMO)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total General:</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {money(totalGeneral)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        className={styles.butonGuardar}
                        onClick={enviarOrden}
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "Guardar orden de servicio"}
                    </button>
                </div>
            </div>
        </div>
    );
}
