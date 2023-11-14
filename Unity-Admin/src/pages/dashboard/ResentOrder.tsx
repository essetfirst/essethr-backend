import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Avatar, Button, Card, CardActions, CardContent, Chip, Divider, Grid, Menu, MenuItem, Typography } from '@mui/material';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import moment from 'moment';
import { Link } from 'react-router-dom';


// ===========================|| DASHBOARD - RECENT ORDER ||=========================== //


const RecentOrder = ({ orders }: any) => {
    const theme: any = useTheme();

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    // console.log(" Recent Orders ", orders.booking.slice(0, 5))

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getFullName = (obj: any) => {
        const { contactDetails } = obj
        if (!contactDetails) {
            return "      No Name    "
        }
        else {
            return contactDetails?.firstName + "  " + contactDetails?.lastName 
        }

    }

    return (
        <>
            <Card sx={{
                height: '100%',
                transition: '0.3s',
                borderRadius: '10px',
                boxShadow: '0px 0px 80px 0px rgb(0 0 0 / 10%)',
                '&:hover': {
                    boxShadow: '0px 0px 80px 0px rgb(0 0 0 / 30%)'
                }
            }}>
                <CardContent>
                    <Grid container spacing={9}>
                        <Grid item xs={12}>
                            <Grid container alignContent="center" justifyContent="space-between">
                                <Grid item>
                                    <Typography variant="h5">Recent  News </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            {/* show only 5 orders sort by created date */}
                            {orders?.result?.slice(0,3).map((order: any) => (
                                <Grid container spacing={3} key={order._id}>
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item>
                                                <Typography variant="subtitle1" color="inherit">
                                                    { order.title}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item>
                                                        <Typography variant="subtitle1" color="inherit">
                                                             { order?.status == 2? "Pending" :"Approved"}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item>
                                                <Typography variant="caption" color="secondary">
                                                    {moment(order.createdAt).fromNow()}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Divider />
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                </CardContent>
                <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
                    <Button size="small" disableElevation>
                        <Link to="/app/news" style={{ textDecoration: 'none', color: 'inherit' }}>
                            View All
                        </Link>
                        <ChevronRightOutlinedIcon />
                    </Button>
                </CardActions>
            </Card>
        </>
    );
};

export default RecentOrder
