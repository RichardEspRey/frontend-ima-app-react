import React from 'react';
import { Box, Paper, Typography, Grid, IconButton, Button, TextField, Chip, Divider, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import DatePicker from 'react-datepicker';
import { selectStyles, getDocumentUrl } from '../../utils/tripFormConstants';

const DocButton = ({ label, doc, onClick, disabled, apiHost }) => (
    <Box sx={{ mb: 1 }}>
        <Typography variant="caption" display="block" fontWeight={500}>{label}</Typography>
        <Button 
            variant="outlined" 
            size="small" 
            startIcon={<UploadFileIcon />} 
            onClick={onClick} 
            disabled={disabled}
            fullWidth
            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
        >
            Subir/Ver
        </Button>
        {doc && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic', wordBreak: 'break-all' }}>
                <a href={getDocumentUrl(doc, apiHost)} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none', color:'#1976d2'}}>
                    {doc.fileName}
                </a>
                {doc.vencimiento && ` (V: ${doc.vencimiento})`}
            </Typography>
        )}
    </Box>
);

const StageCard = ({
    etapa,
    index,
    handleStageChange,
    eliminarEtapa,
    agregarParadaEnRuta,
    eliminarParadaEnRuta,
    handleStopChange,
    abrirModal,
    isFormDisabled,
    options,
    creators,
    loadingStates,
    apiHost
}) => {
    
    const getHeaderInfo = () => {
        switch (etapa.stageType) {
            case 'borderCrossing': return { label: 'Cruce Fronterizo', color: '#ff9800' };
            case 'emptyMileage': return { label: 'Etapa Vacía', color: '#9e9e9e' };
            default: return { label: 'Viaje Normal', color: '#2196f3' };
        }
    };
    const headerInfo = getHeaderInfo();

    return (
        <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden', borderLeft: `6px solid ${headerInfo.color}` }}>
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label={index + 1} size="small" style={{ backgroundColor: headerInfo.color, color: '#fff', fontWeight: 'bold' }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                        {headerInfo.label}
                    </Typography>
                </Stack>
                <Box>
                    {(etapa.stageType === 'normalTrip' || etapa.stageType === 'borderCrossing') && (
                        <Button 
                            startIcon={<AddCircleOutlineIcon />} 
                            size="small" 
                            onClick={() => agregarParadaEnRuta(index)}
                            disabled={isFormDisabled}
                            sx={{ mr: 1 }}
                        >
                            Parada
                        </Button>
                    )}
                    <IconButton size="small" color="error" onClick={() => eliminarEtapa(index)} disabled={isFormDisabled}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                {etapa.stageType === 'emptyMileage' ? (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Millas PC*Miler Cortas" type="number" size="small"
                                value={etapa.millas_pcmiller} onChange={(e) => handleStageChange(index, 'millas_pcmiller', e.target.value)} disabled={isFormDisabled} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Millas Prácticas" type="number" size="small"
                                value={etapa.millas_pcmiller_practicas} onChange={(e) => handleStageChange(index, 'millas_pcmiller_practicas', e.target.value)} disabled={isFormDisabled} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Comentarios" multiline rows={2} size="small"
                                value={etapa.comments} onChange={(e) => handleStageChange(index, 'comments', e.target.value)} disabled={isFormDisabled} />
                        </Grid>
                    </Grid>
                ) : (
                    <>
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" color="textSecondary">Compañía</Typography>
                                <CreatableSelect
                                    value={options.companies.find(opt => opt.value === etapa.company_id) || null}
                                    onChange={(sel) => handleStageChange(index, 'company_id', sel?.value || '')}
                                    onCreateOption={(val) => creators.createCompany(val, index, 'company_id')}
                                    options={options.companies}
                                    isLoading={loadingStates.companies}
                                    isDisabled={isFormDisabled}
                                    styles={selectStyles}
                                    placeholder="Seleccionar/Crear..."
                                    formatCreateLabel={(v) => `Crear "${v}"`}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" color="textSecondary">Dirección Viaje</Typography>
                                <Select
                                    value={etapa.travel_direction ? { value: etapa.travel_direction, label: etapa.travel_direction } : null}
                                    onChange={(sel) => handleStageChange(index, 'travel_direction', sel?.value || '')}
                                    options={[{ value: 'Going Up', label: 'Going Up' }, { value: 'Going Down', label: 'Going Down' }]}
                                    isDisabled={isFormDisabled}
                                    styles={selectStyles}
                                    placeholder="Seleccionar..."
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="CI Number" size="small"
                                    value={etapa.ci_number} onChange={(e) => handleStageChange(index, 'ci_number', e.target.value)} disabled={isFormDisabled} 
                                    sx={{ mt: 2.5 }} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" color="textSecondary">Bodega Origen</Typography>
                                <CreatableSelect
                                    value={options.warehouses.find(opt => opt.value === etapa.warehouse_origin_id) || null}
                                    onChange={(sel) => handleStageChange(index, 'warehouse_origin_id', sel?.value || '')}
                                    onCreateOption={(val) => creators.createWarehouse(val, index, 'warehouse_origin_id')}
                                    options={options.warehouses}
                                    isLoading={loadingStates.warehouses}
                                    isDisabled={isFormDisabled}
                                    styles={selectStyles}
                                    placeholder="Seleccionar/Crear..."
                                />
                                <TextField fullWidth placeholder="Ciudad/Estado Origen" size="small" margin="dense"
                                    value={etapa.origin} onChange={(e) => handleStageChange(index, 'origin', e.target.value)} disabled={isFormDisabled} />
                                <TextField fullWidth placeholder="Zip Code Origen" size="small" margin="dense"
                                    value={etapa.zip_code_origin} onChange={(e) => handleStageChange(index, 'zip_code_origin', e.target.value)} disabled={isFormDisabled} />
                                <Box mt={1}>
                                    <DatePicker selected={etapa.loading_date} onChange={(date) => handleStageChange(index, 'loading_date', date)} 
                                        dateFormat="dd/MM/yyyy" placeholderText="Fecha Carga" className="form-input" disabled={isFormDisabled} />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" color="textSecondary">Bodega Destino</Typography>
                                <CreatableSelect
                                    value={options.warehouses.find(opt => opt.value === etapa.warehouse_destination_id) || null}
                                    onChange={(sel) => handleStageChange(index, 'warehouse_destination_id', sel?.value || '')}
                                    onCreateOption={(val) => creators.createWarehouse(val, index, 'warehouse_destination_id')}
                                    options={options.warehouses}
                                    isLoading={loadingStates.warehouses}
                                    isDisabled={isFormDisabled}
                                    styles={selectStyles}
                                    placeholder="Seleccionar/Crear..."
                                />
                                <TextField fullWidth placeholder="Ciudad/Estado Destino" size="small" margin="dense"
                                    value={etapa.destination} onChange={(e) => handleStageChange(index, 'destination', e.target.value)} disabled={isFormDisabled} />
                                <TextField fullWidth placeholder="Zip Code Destino" size="small" margin="dense"
                                    value={etapa.zip_code_destination} onChange={(e) => handleStageChange(index, 'zip_code_destination', e.target.value)} disabled={isFormDisabled} />
                                <Box mt={1}>
                                    <DatePicker selected={etapa.delivery_date} onChange={(date) => handleStageChange(index, 'delivery_date', date)} 
                                        dateFormat="dd/MM/yyyy" placeholderText="Fecha Entrega" className="form-input" disabled={isFormDisabled} />
                                </Box>
                            </Grid>

                            <Grid item xs={6} md={3}>
                                <TextField fullWidth label="Tarifa (Rate)" type="number" size="small"
                                    value={etapa.rate_tarifa} onChange={(e) => handleStageChange(index, 'rate_tarifa', e.target.value)} disabled={isFormDisabled} />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField 
                                    fullWidth 
                                    label="Invoice Number" 
                                    size="small"
                                    value={etapa.invoice_number || ''} 
                                    onChange={(e) => handleStageChange(index, 'invoice_number', e.target.value)} 
                                    disabled={isFormDisabled} 
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField fullWidth label="Millas Cortas" type="number" size="small"
                                    value={etapa.millas_pcmiller} onChange={(e) => handleStageChange(index, 'millas_pcmiller', e.target.value)} disabled={isFormDisabled} />
                            </Grid>
                             <Grid item xs={6} md={3}>
                                <TextField fullWidth label="Millas Prácticas" type="number" size="small"
                                    value={etapa.millas_pcmiller_practicas} onChange={(e) => handleStageChange(index, 'millas_pcmiller_practicas', e.target.value)} disabled={isFormDisabled} />
                            </Grid>
                             <Grid item xs={12}>
                                <TextField fullWidth label="Comentarios" multiline rows={2} size="small"
                                    value={etapa.comments} onChange={(e) => handleStageChange(index, 'comments', e.target.value)} disabled={isFormDisabled} />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>Documentación</Typography>
                        <Grid container spacing={2}>
                            {etapa.stageType === 'borderCrossing' && (
                                <>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="IMA Invoice" doc={etapa.documentos?.ima_invoice} onClick={() => abrirModal('ima_invoice', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="CI" doc={etapa.documentos?.ci} onClick={() => abrirModal('ci', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="DODA" doc={etapa.documentos?.doda} onClick={() => abrirModal('doda', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="Entry" doc={etapa.documentos?.entry} onClick={() => abrirModal('entry', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="Manifiesto" doc={etapa.documentos?.manifiesto} onClick={() => abrirModal('manifiesto', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="BL" doc={etapa.documentos?.bl} onClick={() => abrirModal('bl', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="Orden Retiro" doc={etapa.documentos?.orden_retiro} onClick={() => abrirModal('orden_retiro', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="BL Firmado" doc={etapa.documentos?.bl_firmado} onClick={() => abrirModal('bl_firmado', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={12} sm={4} md={3}>
                                        <TextField fullWidth label="Cita Entrega" type="time" size="small" InputLabelProps={{shrink:true}}
                                            value={etapa.time_of_delivery || ''} onChange={(e) => handleStageChange(index, 'time_of_delivery', e.target.value)} disabled={isFormDisabled} />
                                    </Grid>
                                </>
                            )}
                            {etapa.stageType === 'normalTrip' && (
                                <>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="IMA Invoice" doc={etapa.documentos?.ima_invoice} onClick={() => abrirModal('ima_invoice', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="CI" doc={etapa.documentos?.ci} onClick={() => abrirModal('ci', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="BL" doc={etapa.documentos?.bl} onClick={() => abrirModal('bl', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={6} sm={4} md={3}><DocButton label="BL Firmado" doc={etapa.documentos?.bl_firmado} onClick={() => abrirModal('bl_firmado', index)} disabled={isFormDisabled} apiHost={apiHost}/></Grid>
                                    <Grid item xs={12} sm={4} md={3}>
                                        <TextField fullWidth label="Cita Entrega" type="time" size="small" InputLabelProps={{shrink:true}}
                                            value={etapa.time_of_delivery || ''} onChange={(e) => handleStageChange(index, 'time_of_delivery', e.target.value)} disabled={isFormDisabled} />
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        {Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0 && (
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom color="warning.dark">Paradas en Ruta ({etapa.stops_in_transit.length})</Typography>
                                {etapa.stops_in_transit.map((stop, stopIndex) => (
                                    <Paper key={stop.stop_id || `stop-${stopIndex}`} sx={{ p: 2, mb: 1, position: 'relative' }}>
                                        <IconButton size="small" sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => eliminarParadaEnRuta(index, stopIndex)} disabled={isFormDisabled}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label={`Destino Parada #${stopIndex + 1}`} size="small" placeholder="Ciudad, Estado, Zip"
                                                    value={stop.location} onChange={(e) => handleStopChange(index, stopIndex, 'location', e.target.value)} disabled={isFormDisabled} />
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <TextField fullWidth label="Hora Entrega" type="time" size="small" InputLabelProps={{shrink:true}}
                                                    value={stop.time_of_delivery || ''} onChange={(e) => handleStopChange(index, stopIndex, 'time_of_delivery', e.target.value)} disabled={isFormDisabled} />
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                 <DocButton label="BL Firmado (Parada)" doc={stop.bl_firmado_doc} onClick={() => abrirModal('bl_firmado_doc', index, stopIndex)} disabled={isFormDisabled} apiHost={apiHost}/>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Paper>
    );
};

export default StageCard;