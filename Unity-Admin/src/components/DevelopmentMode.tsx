import { useTheme } from '@mui/material/styles';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import styled from '@mui/material/styles/styled';
import { Typography } from '@mui/material';



//animate add alert icon on development mode

const StyledAlert = styled(Alert)(({ theme }) => ({
    '& .MuiAlert-icon': {
        animation: theme.palette.mode === 'dark' ? '$alertIconDark 5s ease-in-out infinite' : '$alertIconLight 5s ease-in-out infinite',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        transition: 'all 0.3s ease',
        animationDelay: '0.5s',
        "@keyframes alertIconLight": {
            "0%": {
                animationTimingFunction: 'ease-in',
                transform: 'scale(1)',
            },
            "20%": {
                animationTimingFunction: 'ease-out',
                transform: 'scale(1.5)',
            },
            "40%": {
                animationTimingFunction: 'ease-in',
                transform: 'scale(1)',
            },
            "100%": {
                transform: 'scale(1)',
            },
        },
    },
}));







const DevelopmentMode = ({ codename }: any) => {
    const theme = useTheme();
    return (
                <Grid container spacing={3} sx={{ mt: 2, mb: 1, width: '100%' }}>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <StyledAlert
                            severity="info"
                            sx={{ width: '100%' }}
                        >
                            <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                                {codename} <strong>feature is under development</strong> and will be available soon.

                            </Typography>
                        </StyledAlert>
                    </Grid>
                </Grid>
    );
};

export default DevelopmentMode;


