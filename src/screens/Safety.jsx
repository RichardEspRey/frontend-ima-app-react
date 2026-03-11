import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Box, Paper, Typography, Stack, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Tabs, Tab, TextField, InputAdornment, TablePagination
} from "@mui/material";

import Swal from "sweetalert2";
import SearchIcon from '@mui/icons-material/Search';

import { DocumentCell } from "../components/DocumentCell.jsx";
import { PCMillerModal } from "../components/PCMillerModal.jsx";
import { DocPreviewModal } from "../components/DocPreviewModal.jsx";

const apiHost = import.meta.env.VITE_API_HOST;

const DOC_NAMES = {
  libro_electronico: 'Libro Electrónico',
  reporte_diesel: 'Reporte Diesel',
  reporte_pcmiller: 'Reporte PC Miller',
};

export default function Safety() {
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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
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

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            Safety & Cumplimiento
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Control de documentos para viajes completados.
          </Typography>
        </Box>
      </Stack>

      <Paper
        elevation={0}
        sx={{ mb: 3, bgcolor: 'transparent', borderBottom: '1px solid #e0e0e0' }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, val) => { setTabValue(val); setPage(0); }}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: '40px',
            '& .MuiTab-root': {
              minHeight: '40px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              px: 3
            }
          }}
        >
          <Tab label="Pendientes de Documentación" />
          <Tab label="Cumplimiento Completo" />
        </Tabs>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <TextField
          size="small"
          placeholder="Buscar por Trip #..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
              sx: { bgcolor: 'white', minWidth: 300 }
            }
          }}
        />
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#fff', py: 1.5, width: '15%' }}>Trip #</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#fff', py: 1.5 }}>
                  Libro Electrónico
                  {tabValue === 0 && missingCounts.libro > 0 && (
                    <Chip size="small" label={`${missingCounts.libro} faltan`} color="error" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#fff', py: 1.5 }}>
                  Reporte Diesel
                  {tabValue === 0 && missingCounts.diesel > 0 && (
                    <Chip size="small" label={`${missingCounts.diesel} faltan`} color="error" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#fff', py: 1.5 }}>
                  Reporte PC Miller
                  {tabValue === 0 && missingCounts.pcmiller > 0 && (
                    <Chip size="small" label={`${missingCounts.pcmiller} faltan`} color="error" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                  )}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
              ) : pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No se encontraron viajes en esta categoría.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((row) => (
                  <TableRow key={row.trip_id} hover>
                    <TableCell>
                      <Typography fontWeight={800} color="primary.main" variant="body2">
                        {row.trip_number}
                      </Typography>
                      {row.driver_nombre && (
                        <Typography variant="caption" display="block" color="text.secondary">
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

        <TablePagination
            rowsPerPageOptions={[50, 100, 150]}
            component="div"
            count={filteredTrips.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Filas:"
        />
      </Paper>
    </Container>
  );
}
