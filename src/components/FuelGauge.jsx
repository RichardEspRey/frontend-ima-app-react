import { Box, Typography } from "@mui/material";

const FuelGauge = ({ percent, value, capacity }) => {
    let color = '#2e7d32'; 
    if (percent < 50) color = '#fbc02d'; 
    if (percent < 20) color = '#d32f2f';

    const radius = 80;
    const stroke = 12;
    const arcLength = Math.PI * radius; 
    const strokeDasharray = `${arcLength} ${arcLength}`;
    const strokeDashoffset = arcLength - (percent / 100) * arcLength;

    return (
        <Box sx={{ position: 'relative', width: 200, height: 120, margin: '0 auto' }}>
            <svg width="100%" height="100%" viewBox="0 0 200 110">
                <path
                    d={`M 20,100 A 80,80 0 0 1 180,100`} 
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                />
                <path
                    d={`M 20,100 A 80,80 0 0 1 180,100`}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
                <text x="10" y="105" fontSize="12" fontWeight="bold" fill="#999">E</text>
                <text x="182" y="105" fontSize="12" fontWeight="bold" fill="#999">F</text>
            </svg>
            <Box sx={{ position: 'absolute', bottom: 10, left: 0, width: '100%', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                    {Math.round(percent)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {Math.round(value)} / {capacity} gal
                </Typography>
            </Box>
        </Box>
    );
};

export default FuelGauge;