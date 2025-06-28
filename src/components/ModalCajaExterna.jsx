import React, { useState } from "react";
import Swal from 'sweetalert2';
import './css/ModalCajaExterna.css';

const ModalCajaExterna = ({ isOpen, onClose, onSave }) => {
    const [noCaja, setNoCaja] = useState('');
    const [noVin, setNoVin] = useState('');
    const [modelo, setModelo] = useState('');
    const [anio, setAnio] = useState('');
    const [placas, setPlacas] = useState('');
    const [estado, setEstado] = useState('');
    


    const handleSave = () => {
        if (!noCaja.trim() || !noVin.trim()) {
            Swal.fire('Campos Requeridos', 'El Número de Caja y el VIN son obligatorios.', 'warning');
            return;
        }
        onSave({ no_caja: noCaja, no_vin: noVin, modelo, anio, placas, estado });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay-caja" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Registrar Nueva Caja Externa</h2>
                <div className="input-columns-modal">
                    <div className="column">
                        <label>Número de Caja *</label>
                        <input value={noCaja} onChange={(e) => setNoCaja(e.target.value)} className="form-input" />
                    </div>
                    <div className="column">
                        <label>Número de VIN *</label>
                        <input value={noVin} onChange={(e) => setNoVin(e.target.value)} className="form-input" />
                    </div>
                    <div className="column">
                        <label>Modelo</label>
                        <input value={modelo} onChange={(e) => setModelo(e.target.value)} className="form-input" />
                    </div>
                    <div className="column">
                        <label>Año</label>
                        <input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} className="form-input" />
                    </div>
                    <div className="column">
                        <label>Placas</label>
                        <input value={placas} onChange={(e) => setPlacas(e.target.value)} className="form-input" />
                    </div>
                    <div className="column">
                        <label>Estado</label>
                        <input value={estado} onChange={(e) => setEstado(e.target.value)} className="form-input" />
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="button button-secondary">Cancelar</button>
                    <button type="button" onClick={handleSave} className="button accept-button-modal">Guardar</button>
                </div>
            </div>
        </div>

    );
}

export default ModalCajaExterna;