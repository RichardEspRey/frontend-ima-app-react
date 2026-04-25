import { Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, TextField } from "@mui/material";

const TicketStagesTable = ({ stages, ajustes, handleAjuste, getDestino }) => {
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>Detalle de Recorrido</Typography>
      <Table size="small" sx={{ mb: 4 }}>
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Destino (Zip / Ciudad)</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tipo Etapa</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Millas Orig.</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Ajuste (-)</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Millas Finales</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stages.map((s, i) => {
            const ajuste = ajustes[s.stage_number] ?? 0;
            const finalMillas = Number(s.millas_pcmiller) - ajuste;
            const isEmtpy = s.stageType === "emptyMileage";

            return (
              <TableRow key={s.stage_number}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{s.zip_code_destination || "N/A"}</Typography>
                  <Typography variant="caption" color={isEmtpy ? "error" : "text.secondary"}>
                        {getDestino(s, i)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                      label={isEmtpy ? "Vacía" : "Normal"} 
                      size="small" 
                      color={isEmtpy ? "default" : "primary"} 
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{Number(s.millas_pcmiller).toFixed(2)}</TableCell>
                
                <TableCell align="center">
                  <TextField
                    size="small"
                    type="number"
                    placeholder="0"
                    value={ajustes[s.stage_number] ?? ""}
                    onChange={(e) => handleAjuste(s.stage_number, e.target.value)}
                    sx={{ width: 80, '& input': { textAlign: 'center', p: 0.5 } }}
                  />
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 700 }}>{finalMillas.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default TicketStagesTable;