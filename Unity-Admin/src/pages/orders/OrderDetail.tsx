import React from 'react'
import { useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import LoadingComponent from "../../components/LoadingComponent";
import { useQuery } from 'react-query';
import { getOrder } from '../../api/ordersApi';
import { Box, Button, Card, Container, CardContent, CardHeader, Divider, Grid, Typography, Paper } from '@mui/material';
import PageView from "../../components/PageView";
import { styled } from '@mui/system';
import moment from 'moment';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import Chip from '@mui/joy/Chip';
import { CheckCircleOutlineRounded, ErrorOutlineRounded, HourglassEmptyRounded, LocalShippingRounded, CurrencyRupeeRounded,ConfirmationNumberRounded} from '@mui/icons-material';
import { CssVarsProvider } from '@mui/joy/styles';
import Star from '@mui/icons-material/Star';
// import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
const TimelineItemStyled = styled(TimelineItem)(({ theme }) => ({
    '&:before': {
        flex: 0,
        padding: 0,
    },
    '&:after': {
        flex: 0,
        padding: 0,
    },
}));

const OrderDetail = () => {
    const theme: any = useTheme();
    const { id }: any = useParams();
    const { isLoading, data, isError } = useQuery(['order', id], () => getOrder(id));
    console.log(isLoading,data,id)
    
    if (isLoading) {
        return (
            <PageView title="Booking Detail">
                <LoadingComponent />
            </PageView>
        )
    }

    if (isError) {
        return (
            <PageView title="Booking Detail">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Typography variant="h4" color="textSecondary" gutterBottom>
                        Something went wrong!
                    </Typography>
                </Box>
            </PageView>
        )
    }

    const order = data

    return (
        <PageView title="Booking Detail" backPath="/orders">
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={6}>
                        <Card sx={{ height: '100%' }} variant="outlined">
                            <CardHeader
                                title="Booking Information"
                                subheader={
                                    <Typography variant="caption" color="secondary" gutterBottom>
                                        {order?.booking._id.substr(-10)}
                                    </Typography>
                                }
                            />
                            <Divider />
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking ID - Ref
                                        </Typography>
                                        <Typography variant="body1" color="textPrimary" gutterBottom>
                                            {order.booking._id.substr(-10)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Date
                                        </Typography>
                                        <Typography variant="body1" color="textPrimary" gutterBottom>
                                           {new Date(order?.booking.createdAt.split("T")[0]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  - ({moment(order?.booking.createdAt).fromNow()})
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Status
                                        </Typography>
                                        <CssVarsProvider>
                                            {order.booking.status === 'Pending' && (
                                                <Chip
                                                    variant="soft"
                                                    color="danger"
                                                    size='sm'
                                                    startDecorator={<HourglassEmptyRounded />}
                                                >
                                                    {order.booking.status}
                                                </Chip>
                                            ) || order.booking.status === 'Approved' && (
                                                <Chip
                                                    variant="soft"
                                                    color="success"
                                                    size='sm'
                                                    startDecorator={<CheckCircleOutlineRounded />}
                                                >
                                                    {order.booking.status}
                                                </Chip>
                                            ) || order.booking.status === 'Paid' && (
                                                <Chip
                                                    variant="soft"
                                                    size='sm'
                                                    startDecorator={<CurrencyRupeeRounded />}
                                                >
                                                    {order.booking.status}
                                                </Chip>
                                            )  || order.booking.status === 'Confirmed' && (
                                                <Chip
                                                    variant="soft"
                                                    size='sm'
                                                    startDecorator={<ConfirmationNumberRounded />}
                                                >
                                                    {order.booking.status}
                                                </Chip>
                                            )}
                                        </CssVarsProvider>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Total
                                        </Typography>
                                        <Typography variant="body1" color="textPrimary" fontWeight={"bold"} gutterBottom>
                                           {order.booking.totalPrice}                                        
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                        <Card sx={{ height: '100%' }} variant="outlined">
                            <CardHeader
                                title="Contact Details Information"
                                subheader={
                                    <Typography variant="caption" color="secondary" gutterBottom>
                                        {order.booking?.contactDetails?.firstName }  {order.booking?.contactDetails?.lastName }
                                    </Typography>
                                }
                            />
                            <Divider />
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Customer Name
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" gutterBottom>
                                        {order.booking?.contactDetails?.firstName }  {order.booking?.contactDetails?.lastName }
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Customer Email
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" gutterBottom>
                                            {order.booking?.contactDetails?.email}

                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Customer Phone
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" gutterBottom>
                                            {order.booking?.contactDetails?.phoneNumber}
                                        </Typography>
                                    </Grid>
                                    
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Card sx={{ height: '100%' }} variant="outlined">
                            <CardHeader
                                title="Booking Details"
                                subheader={
                                    <Typography variant="body1" color="secondary" gutterBottom>
                                        {/* {order.items.length} Items */}
                                    </Typography>
                                }
                            />
                            <Divider />
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={12} lg={12}>
                                        <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking  Name
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" fontWeight={"bold"} gutterBottom>
                                       {order.booking.option.name }  
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Description
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" fontWeight={"bold"} gutterBottom>
                                        {order.booking.option.description }  

                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Unit Price
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" fontWeight={"bold"} gutterBottom>
                                        {order.booking.option.unitPrice }  
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Quantity
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" fontWeight={"bold"} gutterBottom>
                                          {order.booking.quantity }  

                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Date and Time
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" fontWeight={"bold"}  gutterBottom>
                                                {order.booking.date.split("T")[0]}  At  {order.booking.option.time}  
                                        </Typography>
                                    </Grid>
                                        
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'textPrimary' : 'textSecondary'} gutterBottom>
                                            Booking Pickup Location
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" fontWeight={"bold"} gutterBottom >
                                            {  order.booking.pickupLocation || "-" }   
                                        </Typography>
                                    </Grid>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </PageView>
    )
}

export default OrderDetail