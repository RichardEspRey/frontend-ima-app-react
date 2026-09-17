import ModalArchivo from '../ModalArchivo';
import ModalCajaExterna from '../ModalCajaExterna';
import ModalGastoDtops from '../BorderCrossingFormNew2/ModalGastoDtops';

const ModalsContainer = ({
    modalAbierto, setModalAbierto, setModalTarget, handleGuardarDocumento, modalTarget, 
    getCurrentDocValueForModal, mostrarFechaVencimientoModal, isModalCajaExternaOpen, 
    setIsModalCajaExternaOpen, handleSaveExternalCaja, gastoDtops, onCerrarGastoDtops, tripNumber
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
            {gastoDtops && (
                <ModalGastoDtops
                    open
                    onClose={onCerrarGastoDtops}
                    archivo={gastoDtops.archivo}
                    yaExistia={gastoDtops.yaExistia}
                    tripNumber={tripNumber}
                />
            )}
        </>
    );
};

export default ModalsContainer;