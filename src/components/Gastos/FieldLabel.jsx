import { Typography } from '@mui/material';
import { COLOR } from '../../shared/ui/tokens';

const FieldLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{ display: 'block', mb: 0.5, color: COLOR.TEXTO_SUAVE, fontWeight: 600, fontSize: '0.75rem' }}
  >
    {children}
  </Typography>
);

export default FieldLabel;
