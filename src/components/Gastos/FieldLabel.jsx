import { Typography } from '@mui/material';

const FieldLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{ display: 'block', mb: 0.5, color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}
  >
    {children}
  </Typography>
);

export default FieldLabel;
