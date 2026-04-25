import ModalArchivo from '../../../../core/ui/ModalArchivo.jsx';
import ModalCajaExterna from '../../../vehicles/components/ModalCajaExterna.jsx';

const ModalsContainer = ({
    modalAbierto, setModalAbierto, setModalTarget, handleGuardarDocumento, modalTarget, 
    getCurrentDocValueForModal, mostrarFechaVencimientoModal, isModalCajaExternaOpen, 
    setIsModalCajaExternaOpen, handleSaveExternalCaja
}) => {
    return (
        <>
            {modalAbierto && (
                <ModalArchivo
                    isOpen={modalAbierto}
                    onClose={() => { setModalAbierto(false); setModalTarget({ stageIndex: null, docType: null, stopIndex: null }); }}
                    onSave={handleGuardarDocumento}
                    nombreCampo={modalTarget.docType}
                    valorActual={getCurrentDocValueForModal()}
                    mostrarFechaVencimiento={mostrarFechaVencimientoModal}
                />
            )}
            {isModalCajaExternaOpen && (
                <ModalCajaExterna
                    isOpen={isModalCajaExternaOpen}
                    onClose={() => setIsModalCajaExternaOpen(false)}
                    onSave={handleSaveExternalCaja}
                />
            )}
        </>
    );
};

export default ModalsContainer;