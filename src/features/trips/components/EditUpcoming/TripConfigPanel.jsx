import { Paper, Typography, Grid, TextField, MenuItem, Stack, FormControlLabel, Checkbox, Box, Divider } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NumbersIcon from '@mui/icons-material/Numbers';

const TripConfigPanel = ({
    pais, setPais, anio, setAnio, tripNumber, tripYear2Digits,
    viajeTransnacional, handleTransnationalChange,
    isContinuation, handleContinuationChange,
    selectedTransnational, setSelectedTransnational,
    transnationalTrips, oppositeCountry,
    movementNumber, setMovementNumber
}) => {
    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShippingIcon color="primary" /> Configuración General
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3} alignItems="flex-start">
                {/* País */}
                <Grid item xs={12} md={2}>
                    <TextField
                        select label="País Base" value={pais} onChange={(e) => setPais(e.target.value)}
                        fullWidth size="small"
                        InputProps={{ startAdornment: <LanguageIcon fontSize="small" sx={{ mr: 1 }} /> }}
                    >
                        <MenuItem value="MX">México (MX)</MenuItem>
                        <MenuItem value="US">Estados Unidos (US)</MenuItem>
                    </TextField>
                </Grid>

                {/* Año */}
                <Grid item xs={12} md={2}>
                    <TextField
                        label="Año" type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))}
                        fullWidth size="small"
                        InputProps={{ startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} /> }}
                    />
                </Grid>

                {/* Trip Number */}
                <Grid item xs={12} md={3}>
                    <TextField
                        label="Trip Number" value={tripNumber} fullWidth size="small" disabled
                        helperText={pais && tripNumber ? `ID Final: ${pais}${tripYear2Digits}-${tripNumber}` : "Seleccione país y año"}
                        InputProps={{ startAdornment: <NumbersIcon fontSize="small" sx={{ mr: 1 }} /> }}
                    />
                </Grid>

                {/* Transnacional */}
                <Grid item xs={12} md={5}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                        <Stack spacing={1}>
                            <FormControlLabel
                                control={<Checkbox checked={viajeTransnacional} onChange={handleTransnationalChange} />}
                                label="Viaje transnacional"
                            />

                            {viajeTransnacional && (
                                <Box sx={{ pl: 3 }}>
                                    <FormControlLabel
                                        control={<Checkbox checked={isContinuation} onChange={handleContinuationChange} size="small" />}
                                        label={`Continuación (${oppositeCountry})`}
                                    />

                                    {isContinuation && (
                                        <TextField
                                            select label={`Vincular con Viaje ${oppositeCountry}`}
                                            value={selectedTransnational} onChange={(e) => setSelectedTransnational(e.target.value)}
                                            fullWidth size="small" margin="dense"
                                        >
                                            <MenuItem value="">-- Seleccione --</MenuItem>
                                            {transnationalTrips.map((t) => (
                                                <MenuItem
                                                    key={t.transnational_number ?? t.trip_id ?? `${t.trip_number}-${t.trip_year}`}
                                                    value={t.transnational_number ?? t.trip_number}
                                                >
                                                    {t.trip_number && t.country_code && t.transnational_number
                                                        ? `${t.trip_number}-${t.country_code}-${t.transnational_number}T${t.movement_number}-${t.trip_year}`
                                                        : (t.trip_number ?? "Viaje")}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}

                                    <TextField
                                        label="Movimiento" value={movementNumber} onChange={(e) => setMovementNumber(e.target.value)}
                                        fullWidth size="small" margin="dense" placeholder="Opcional"
                                    />
                                </Box>
                            )}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TripConfigPanel;