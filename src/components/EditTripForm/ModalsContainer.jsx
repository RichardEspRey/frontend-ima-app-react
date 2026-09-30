import ModalArchivo from '../ModalArchivo';
import { TIPOS_DOCUMENTO_VIAJE } from '../../utils/tripFormConstants';
import ModalCajaExterna from '../ModalCajaExterna';

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
                    accept={TIPOS_DOCUMENTO_VIAJE}
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