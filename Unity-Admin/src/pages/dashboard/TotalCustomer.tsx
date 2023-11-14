import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import MainCard from '../../components/MainCard';
import { PersonOutlineRounded } from '@mui/icons-material';


const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: "#1c4b9a",
    color: theme.palette.primary.light,
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        borderRadius: '50%',
        top: -30,
        right: -180,
        background: "#5e35b1",
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        borderRadius: '50%',
        top: -160,
        right: -130,
        background: "#1b7fdc",
    }
}));


const TotalCustomer = ({ totalCustomer }: any) => {
    const theme: any = useTheme();

    return (
        <CardWrapper border={false} content={false}>
            <Box sx={{ p: 2 }}>
                <List sx={{ py: 0 }}>
                    <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                        <ListItemAvatar>
                            <Avatar
                                variant="rounded"
                                sx={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.largeAvatar,
                                    backgroundColor: '#1565c0',
                                    color: '#fff',
                                    opacity: 0.9
                                }}
                            >
                                <PersonOutlineRounded fontSize="inherit" />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            sx={{
                                py: 0,
                                mt: 0.45,
                                mb: 0.45
                            }}
                            primary={
                                <Typography variant="h4" sx={{ color: '#fff' }}>
                                    {totalCustomer}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="h6" sx={{ color: '#fff' }}>
                                    Total User
                                </Typography>
                            }
                        />
                    </ListItem>
                </List>
            </Box>
        </CardWrapper>
    );
};


export default TotalCustomer;