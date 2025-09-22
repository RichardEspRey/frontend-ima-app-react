import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import styles from "../screens/css/Orden.module.css";

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

/* === Money fmt (MXN) === */
const money = (v) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(v || 0)
  );

export default function ServiceOrderScreenEdit() {
  const navigate = useNavigate();
  const { orderId } = useParams(); // <- /editar-orden/:orderId

  // ---------- Datos remotos ----------
  const { trucks } = useFetchTrucks();
  const { inventoryItems, loading: itemsLoading } = useFetchInventoryItems();
  const { repairTypes, /* loadingRepairTypes, */ refetchRepairTypes } =
    useFetchRepairTypes();

  // Mapea trucks a react-select
  const truckOptions = useMemo(
    () =>
      (trucks || []).map((t) => ({
        value:
          t.value ?? t.id ?? t.truck_id ?? String(t.unidad ?? t.nombre ?? t.id),
        label:
          t.label ??
          t.unidad ??
          t.nombre ??
          String(t.value ?? t.id ?? t.truck_id ?? ""),
      })),
    [trucks]
  );

  // Mapea inventario a react-select con costo & stock
  const invOptions = useMemo(
    () =>
      (inventoryItems || []).map((it) => ({
        value: it.value ?? it.id ?? it.item_id,
        label: it.label ?? it.nombre ?? it.descripcion ?? "",
        costo_unidad:
          parseFloat(it.costo_unidad ?? it.costoUnitario ?? 0) || 0,
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

  const seleccionarOrden = () => {
    if (!selectedTruck?.value || !dateForm) {
      alert("Selecciona camión y fecha");
      return;
    }
    setOrden({ truck: String(selectedTruck.value), fecha: dateForm });
  };

  // ---------- Constructor de servicio ----------
  const [tipoMantenimiento, setTipoMantenimiento] = useState(null); // {value,label}
  const [tipoReparacion, setTipoReparacion] = useState(null); // {value,label}
  const [svc, setSvc] = useState({
    tipoCambio: "",
    costoMO: "",
    usarItems: false,
  });

  // Items a agregar al servicio en curso
  const [itemSeleccionado, setItemSeleccionado] = useState(null); // {value,label,costo_unidad,cantidad_stock}
  const [cant, setCant] = useState(1);
  const [pendItems, setPendItems] = useState([]); // [{uid, inventarioId, descripcion, tipo, cantidad, costoUnitario, subtotal}]

  const stockSelected = useMemo(
    () => Number(itemSeleccionado?.cantidad_stock || 0),
    [itemSeleccionado]
  );

  const handleCantidadChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setCant("");
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      setCant("");
      return;
    }
    if (stockSelected && n > stockSelected) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad excedida",
        text: "No se puede colocar una cantidad mayor a la disponible en stock",
      });
      setCant("");
      return;
    }
    setCant(n);
  };

  const onChangeItem = (opt) => {
    setItemSeleccionado(opt);
    setCant("");
  };

  const addItemToPending = (tipo /* 'consumible' | 'refaccion' */) => {
    if (!svc.usarItems) return;
    const cantidad = Number(cant);
    if (!itemSeleccionado?.value || !cantidad || cantidad <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Falta información",
        text: "Selecciona un artículo y una cantidad válida.",
      });
      return;
    }
    const costoUnitario = Number(itemSeleccionado.costo_unidad || 0);
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
      tipo,
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
  const [services, setServices] = useState(
    [] // {id, svcId?, mantenimiento:{value,label}, reparacion:{value,label}, estatus?, costoMO, items:[]}
  );

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
      estatus: "Pendiente",
      tipoCambio: svc.tipoCambio || "",
      costoMO: Number(svc.costoMO || 0),
      items: svc.usarItems ? [...pendItems] : [],
    };

    setServices((prev) => [...prev, nuevo]);

    // Reset builder
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

  // ---------- CARGAR ORDEN PARA EDICIÓN ----------
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!orderId) return;

    const fetchById = async () => {
      setLoading(true);
      const form = new FormData();
      form.append("op", "getOrderById");
      form.append("id_orden", orderId);
      try {
        const res = await fetch(`${apiHost}/service_order.php`, {
          method: "POST",
          body: form,
        });
        const json = await res.json();

        if (json?.status !== "success") {
          throw new Error(json?.message || "No se pudo obtener la orden.");
        }

        const { orden: o, servicios = [] } = json.data || {};

        // Header
        setOrden({
          truck: String(o.truck_id ?? ""),
          fecha: o.fecha_orden ?? new Date().toISOString().slice(0, 10),
        });
        setDateForm(o.fecha_orden ?? new Date().toISOString().slice(0, 10));

        // Intentar seleccionar el truck en el select (cuando ya esté cargado)
        // si trucks llega después, este efecto siguiente lo cuadra:
        if (o.truck_id != null && truckOptions.length > 0) {
          const opt = truckOptions.find(
            (x) => String(x.value) === String(o.truck_id)
          );
          if (opt) setSelectedTruck(opt);
        }

        // Mapear servicios API -> UI
        const mapped = (servicios || []).map((svcApi) => {
          const detalles = svcApi.detalles || [];
          // mano de obra: suma
          const mo = detalles
            .filter(
              (d) =>
                String(d.tipo_detalle || "").toLowerCase() === "mano de obra"
            )
            .reduce((acc, d) => acc + Number(d.costo || 0), 0);

          // items (consumibles/refacciones)
          const items = detalles
            .filter(
              (d) =>
                String(d.tipo_detalle || "").toLowerCase() !== "mano de obra"
            )
            .map((d) => ({
              uid: `${svcApi.id_servicio}-${d.id_detalle || Math.random()}`,
              inventarioId: d.id_articulo ? String(d.id_articulo) : null,
              descripcion: d.descripcion || "",
              tipo:
                String(d.tipo_detalle || "").toLowerCase() === "refaccion"
                  ? "refaccion"
                  : "consumible",
              cantidad: Number(d.cantidad || 0),
              costoUnitario: Number(d.costo || 0),
              subtotal: Number(d.cantidad || 0) * Number(d.costo || 0),
            }));

          return {
            id: svcApi.id_servicio, // usamos id real como id local
            svcId: svcApi.id_servicio, // guardamos id_servicio para saber que es existente
            mantenimiento: {
              value: svcApi.tipo_mantenimiento,
              label: svcApi.tipo_mantenimiento,
            },
            reparacion: {
              value: svcApi.tipo_reparacion,
              label: svcApi.tipo_reparacion,
            },
            estatus: svcApi.estatus || "Pendiente",
            tipoCambio: "",
            costoMO: mo,
            items,
          };
        });

        setServices(mapped);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", String(e.message || e), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, apiHost]);

  // Si trucks llega después del fetch, intenta seleccionar el option correcto
  useEffect(() => {
    if (!orden.truck || !truckOptions.length) return;
    const opt = truckOptions.find(
      (x) => String(x.value) === String(orden.truck)
    );
    if (opt) setSelectedTruck(opt);
  }, [truckOptions, orden.truck]);

  // ---------- Guardar orden (UPDATE) ----------
  const [saving, setSaving] = useState(false);

  const enviarOrden = async () => {
    if (!orden.truck || !orden.fecha || services.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos",
        text: "Selecciona camión/fecha y agrega al menos un servicio.",
      });
      return;
    }

    // ordenData para cabecera
    const ordenData = {
      fecha: orden.fecha,
      truck_id: orden.truck,
    };

    // serviciosData según nuevo esquema
    const serviciosData = services.map((s) => {
      // Detalles construidos: items + (opcional) 1 línea de MO
      const detalles = [
        ...s.items.map((i) => ({
          id_articulo: i.inventarioId ? Number(i.inventarioId) : null,
          tipo_detalle:
            String(i.tipo || "").toLowerCase() === "refaccion"
              ? "Refaccion"
              : "Consumible",
          descripcion: i.descripcion || "",
          cantidad: Number(i.cantidad || 0),
          costo: Number(i.costoUnitario || 0),
        })),
      ];

      if (Number(s.costoMO || 0) > 0) {
        detalles.push({
          id_articulo: null,
          tipo_detalle: "Mano de Obra",
          descripcion: "Mano de Obra",
          cantidad: 1,
          costo: Number(s.costoMO || 0),
        });
      }

      return {
        id_servicio: s.svcId ?? null, // existente si viene de la DB
        tipo_mantenimiento: s.mantenimiento?.label || s.mantenimiento?.value,
        tipo_reparacion: s.reparacion?.label || s.reparacion?.value,
        estatus: s.estatus || "Pendiente",
        detalles,
      };
    });

    const form = new FormData();
    form.append("op", "UpdateOrder");
    form.append("id_orden", String(orderId));
    form.append("ordenData", JSON.stringify(ordenData));
    form.append("serviciosData", JSON.stringify(serviciosData));

    try {
      setSaving(true);
      Swal.fire({
        title: "Guardando cambios...",
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
        title: "Orden actualizada",
        text: `La orden #${orderId} se actualizó correctamente.`,
      });
      navigate("/admin-service-order");
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

  //Crear nuevo tipo de reparación (por si lo usas en edición)
  const handleCreateRepairType = async (inputValue) => {
    Swal.fire({
      title: `Creando "${inputValue}"...`,
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    const formData = new FormData();
    formData.append("op", "createRepairType");
    formData.append("nombre_reparacion", inputValue);

    try {
      const response = await fetch(`${apiHost}/service_order.php`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.status === "success") {
        await refetchRepairTypes?.();
        setTipoReparacion(result.data);

        Swal.fire({
          icon: "success",
          title: "¡Creado!",
          text: `"${inputValue}" ha sido añadido a la lista.`,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className={styles.column2}>
      <h1 className={styles.title}>Editar Orden de Servicio #{orderId}</h1>

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
                  onClick={() => setOrden({ truck: selectedTruck?.value ?? null, fecha: dateForm })}
                  disabled={loading}
                >
                  Seleccionar
                </button>
              </div>
            </div>
          </div>

          {/* Form de servicio (agregar nuevos si quieres durante la edición) */}
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
                  options={repairTypes}
                  value={tipoReparacion}
                  placeholder="Selecciona o escribe para crear..."
                  formatCreateLabel={(v) => `Crear nuevo: "${v}"`}
                  onCreateOption={handleCreateRepairType}
                />
              </div>

              <div className={styles.column}>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Cambio (si aplica)
                </label>
                <input
                  className={styles.select}
                  placeholder="Ej. 17.50"
                  value={svc.tipoCambio}
                  onChange={(e) => setSvc((s) => ({ ...s, tipoCambio: e.target.value }))}
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
                  <input type="number" className={styles.input} value={stockSelected} readOnly />
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
                            <td className="py-2 pr-2 text-right">{money(it.costoUnitario)}</td>
                            <td className="py-2 pr-2 text-right">{money(it.subtotal)}</td>
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

        {/* Columna derecha: Resumen & servicios agregados (UI local) */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <div className={styles.contenido}>
            <h3 className="text-lg font-semibold mb-2">Resumen de la Orden</h3>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Camión:</span> {orden.truck || "N/A"}
              </div>
              <div>
                <span className="font-medium">Fecha:</span> {orden.fecha || "—"}
              </div>
              <div>
                <span className="font-medium">Total:</span> {money(totalGeneral)}
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
                        <span className="font-medium">MO:</span> {money(s.costoMO)}
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
            disabled={saving || loading}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
