import { Grid, TextField } from '@mui/material';

const EmptyStage = ({ etapa, index, updateStage }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Millas PC*Miler" type="number" value={etapa.millas_pcmiller} onChange={e => updateStage(index, 'millas_pcmiller', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Millas Prácticas" type="number" value={etapa.millas_pcmiller_practicas} onChange={e => updateStage(index, 'millas_pcmiller_practicas', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Comentarios" multiline value={etapa.comments} onChange={e => updateStage(index, 'comments', e.target.value)} />
            </Grid>
        </Grid>
    );
};

export default EmptyStage;