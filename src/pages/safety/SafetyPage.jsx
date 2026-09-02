import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Box, Paper, Typography, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Tabs, Tab, TextField, InputAdornment, TablePagination
} from "@mui/material";

import Swal from "sweetalert2";
import SearchIcon from '@mui/icons-material/Search';

import { DocumentCell } from "../../components/DocumentCell.jsx";
import { PCMillerModal } from "../../components/PCMillerModal.jsx";
import { DocPreviewModal } from "../../components/DocPreviewModal.jsx";
import {
  PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, TABS_WRAPPER_SX, TAB_SX,
  CARD_SX, SECTION_LABEL_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX,
  PAGINATION_BOX_SX, PAGINATION_SX, CHIP_DANGER_SX,
} from "../../shared/ui/estilos";
import TablaReparaciones from "../../features/inspections/ui/TablaReparaciones.jsx";
import TablaInspecciones from "../../features/inspections/ui/TablaInspecciones.jsx";
import { archivoDelEvento } from "../../shared/security";
import { COLOR } from "../../shared/ui/tokens";

const apiHost = import.meta.env.VITE_API_HOST;

const DOC_NAMES = {
  libro_electronico: 'Libro Electrónico',
  reporte_diesel: 'Reporte Diesel',
  reporte_pcmiller: 'Reporte PC Miller',
};

/**
 * Safety y cumplimiento: qué documentación falta en los viajes cerrados.
 *
 * Cuatro pestañas: viajes pendientes de documentación, los que ya cumplen, y las
 * tablas de reparaciones en ruta e inspecciones, que viven en
 * `features/inspections` porque también son pantallas propias de mantenimientos.
 *
 * @returns {object} La pantalla.
 */
export default function SafetyPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const fileInputRef = useRef(null);
  const [uploadContext, setUploadContext] = useState({ tripId: null, docType: null });
  const [pendingFile, setPendingFile] = useState(null);

  const [pcMillerModal, setPcMillerModal] = useState({ open: false, tripId: null, filename: null });
  const [docPreviewModal, setDocPreviewModal] = useState({ open: false, tripId: null, docType: null, filename: null });

  const fetchSafetyTrips = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("op", "get_safety_trips");
      const res = await fetch(`${apiHost}/safety.php`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.status === "success") {
        setTrips(json.data);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la información de Safety.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSafetyTrips();
  }, [fetchSafetyTrips]);

  const { filteredTrips, missingCounts } = useMemo(() => {
    let result = trips;
    if (search.trim()) {
      result = result.filter(t => String(t.trip_number).includes(search.trim()));
    }

    const pendientes = [];
    const completados = [];
    const counts = { libro: 0, diesel: 0, pcmiller: 0 };

    result.forEach(t => {
      const isComplete = t.libro_electronico && t.reporte_diesel && t.reporte_pcmiller;
      if (isComplete) {
        completados.push(t);
      } else {
        pendientes.push(t);
        if (!t.libro_electronico) counts.libro++;
        if (!t.reporte_diesel) counts.diesel++;
        if (!t.reporte_pcmiller) counts.pcmiller++;
      }
    });

    return {
      filteredTrips: tabValue === 0 ? pendientes : completados,
      missingCounts: counts
    };
  }, [trips, search, tabValue]);

  const triggerFileUpload = (tripId, docType) => {
    setUploadContext({ tripId, docType });
    fileInputRef.current.click();
  };

  // File selected → open correct modal (no upload yet)
  const handleFileChange = async (e) => {
    const file = await archivoDelEvento(e);
    if (!file) return;

    const { tripId, docType } = uploadContext;
    setPendingFile(file);

    if (docType === 'reporte_pcmiller') {
      setPcMillerModal({ open: true, tripId, filename: null });
    } else {
      setDocPreviewModal({ open: true, tripId, docType, filename: null });
    }
  };

  const handlePCMillerClose = () => {
    setPcMillerModal({ open: false, tripId: null, filename: null });
    setPendingFile(null);
  };

  const handleDocPreviewClose = () => {
    setDocPreviewModal({ open: false, tripId: null, docType: null, filename: null });
    setPendingFile(null);
  };

  const handleViewDoc = (tripId, docType, filename) => {
    if (docType === 'reporte_pcmiller') {
      setPcMillerModal({ open: true, tripId, filename });
    } else {
      setDocPreviewModal({ open: true, tripId, docType, filename });
    }
  };

  const pageData = filteredTrips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={PAGE_SHELL_SX}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
      />

      <PCMillerModal
        open={pcMillerModal.open}
        onClose={handlePCMillerClose}
        tripId={pcMillerModal.tripId}
        file={pcMillerModal.filename ? null : pendingFile}
        filename={pcMillerModal.filename}
        onSave={() => { fetchSafetyTrips(); }}
        onDeleteSuccess={() => { fetchSafetyTrips(); }}
      />

      <DocPreviewModal
        open={docPreviewModal.open}
        onClose={handleDocPreviewClose}
        file={docPreviewModal.filename ? null : pendingFile}
        filename={docPreviewModal.filename}
        tripId={docPreviewModal.tripId}
        docType={docPreviewModal.docType}
        docName={DOC_NAMES[docPreviewModal.docType] ?? docPreviewModal.docType}
        onUploadSuccess={() => { fetchSafetyTrips(); }}
        onDeleteSuccess={() => { fetchSafetyTrips(); }}
      />

      <Stack
        direction="row" justifyContent="space-between" alignItems="flex-end"
        mb={4} flexWrap="wrap" gap={2}
      >
        <Box>
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
            Safety · Cumplimiento
          </Typography>
          <Typography variant="h4" fontWeight={800} color={COLOR.TINTA} letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
            Safety &amp; Cumplimiento
          </Typography>
          <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
            Control de documentos para viajes completados.
          </Typography>
        </Box>
      </Stack>

      <Box sx={TABS_WRAPPER_SX}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => { setTabValue(val); setPage(0); }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{ sx: { display: 'none' } }}
          sx={{ minHeight: 0, '& .MuiTabs-flexContainer': { gap: 0.5 } }}
        >
          <Tab label="Pendientes de Documentación" disableRipple sx={TAB_SX} />
          <Tab label="Cumplimiento Completo" disableRipple sx={TAB_SX} />
          <Tab label="Reparaciones en Ruta" disableRipple sx={TAB_SX} />
          <Tab label="Inspecciones Operativas" disableRipple sx={TAB_SX} />
        </Tabs>
      </Box>

      {(tabValue === 0 || tabValue === 1) && (
        <>
          <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
            <Typography variant="overline" sx={SECTION_LABEL_SX}>
              Filtros de Búsqueda
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <TextField
                size="small"
                placeholder="Buscar por Trip #..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: COLOR.TENUE }} />
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'white', minWidth: 300 }
                  }
                }}
              />
            </Box>
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
            <Table size="small">
                <TableHead>
                  <TableRow sx={HEADER_ROW_SX}>
                    <TableCell sx={{ ...HEADER_CELL_SX, width: '15%' }}>Trip #</TableCell>
                    <TableCell sx={HEADER_CELL_SX}>
                      Libro Electrónico
                      {tabValue === 0 && missingCounts.libro > 0 && (
                        <Chip size="small" label={`${missingCounts.libro} faltan`} sx={{ ...CHIP_DANGER_SX, ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell sx={HEADER_CELL_SX}>
                      Reporte Diesel
                      {tabValue === 0 && missingCounts.diesel > 0 && (
                        <Chip size="small" label={`${missingCounts.diesel} faltan`} sx={{ ...CHIP_DANGER_SX, ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell sx={HEADER_CELL_SX}>
                      Reporte PC Miller
                      {tabValue === 0 && missingCounts.pcmiller > 0 && (
                        <Chip size="small" label={`${missingCounts.pcmiller} faltan`} sx={{ ...CHIP_DANGER_SX, ml: 1 }} />
                      )}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : pageData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color={COLOR.APAGADO} fontWeight={600}>
                          No se encontraron viajes.
                        </Typography>
                        <Typography variant="caption" color={COLOR.TENUE}>
                          Ajusta la búsqueda o revisa otra pestaña.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageData.map((row) => (
                      <TableRow key={row.trip_id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color={COLOR.TINTA}>
                            {row.trip_number}
                          </Typography>
                          {row.driver_nombre && (
                            <Typography variant="caption" display="block" color={COLOR.APAGADO}>
                              {row.driver_nombre}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <DocumentCell
                            isUploaded={!!row.libro_electronico}
                            docName="Libro Electrónico"
                            onUpload={() => triggerFileUpload(row.trip_id, 'libro_electronico')}
                            onView={() => handleViewDoc(row.trip_id, 'libro_electronico', row.libro_electronico)}
                          />
                        </TableCell>

                        <TableCell>
                          <DocumentCell
                            isUploaded={!!row.reporte_diesel}
                            docName="Reporte Diesel"
                            onUpload={() => triggerFileUpload(row.trip_id, 'reporte_diesel')}
                            onView={() => handleViewDoc(row.trip_id, 'reporte_diesel', row.reporte_diesel)}
                          />
                        </TableCell>

                        <TableCell>
                          <DocumentCell
                            isUploaded={!!row.reporte_pcmiller}
                            docName="Reporte PC Miller"
                            onUpload={() => triggerFileUpload(row.trip_id, 'reporte_pcmiller')}
                            onView={() => handleViewDoc(row.trip_id, 'reporte_pcmiller', row.reporte_pcmiller)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </TableContainer>

          <Box sx={PAGINATION_BOX_SX}>
            <TablePagination
              rowsPerPageOptions={[50, 100, 150]}
              component="div"
              count={filteredTrips.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              labelRowsPerPage="Filas por página:"
              sx={PAGINATION_SX}
            />
          </Box>
        </>
      )}

      {tabValue === 2 && <TablaReparaciones />}

      {tabValue === 3 && <TablaInspecciones />}
    </Box>
  );
}
