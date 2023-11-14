import React from "react";
import { Chart } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { Typography, Paper, Container, Box, Chip } from "@mui/material";
import LoadingComponent from "../../components/LoadingComponent";
import PageView from "../../components/PageView";
import { colors } from "@mui/material";
import { useOrder } from "../../hooks/useOrder";

import { Chart as ChartJS, registerables } from 'chart.js';
import Grid from "@mui/material/Grid";
import moment from "moment";
ChartJS.register(...registerables);


export default function OrderChart() {
    const theme = useTheme();
    const { report, isLoading, error } = useOrder();

    if (isLoading)
        return (
            <PageView title="Order Report">
                <LoadingComponent />
            </PageView>
        );

    if (error)
        return (
            <PageView title="Order Report">
                <Typography variant="h6" color="error">
                    {error.message}
                </Typography>
            </PageView>
        );

    if (!report)
        return (
            <PageView title="Order Report">
                <Typography variant="h6" color="error">
                    No data found
                </Typography>
            </PageView>
        );

    const allOrder = report.allReport.slice(0, 5);
    const allOrderLabels = allOrder.map((order: any) => {
        const date = moment(order.createdAt).format("MMM Do");
        return date;

    });
    const allOrderData = allOrder.map((order: any) => order.itemOrders);
    const allOrderChart = {
        labels: allOrderLabels,
        datasets: [
            {
                label: "Total Order",
                data: allOrderData,
                backgroundColor: colors.teal[500],
                borderColor: colors.teal[500],
            },
        ],
    };

    // show persentage of payment method used
    const paymentMethod = report.allReport.reduce((acc: any, order: any) => {
        const payment = order.paymentMethod;
        if (!acc[payment]) {
            acc[payment] = 1;
        } else {
            acc[payment] += 1;
        }
        return acc;
    }, {});

    const paymentMethodLabels = Object.keys(paymentMethod);
    const paymentMethodData: any = Object.values(paymentMethod);

    const top5SalesPercentageChart = {
        labels: paymentMethodLabels,
        datasets: [
            {
                label: "Payment Method",
                data: paymentMethodData.map((data: any) => {
                    const percentage = (data / paymentMethodData.reduce((acc: any, data: any) => acc + data)) * 100;
                    return percentage;
                }),

                backgroundColor: [
                    colors.teal[800],
                    colors.indigo[600],
                    colors.deepOrange[400],
                    colors.orange[400],
                    colors.purple[50],
                ],
                borderColor: colors.teal[500],
                cutout: "40%",
            },
        ],
    };




    const options: any = {
        plugins: {
            legend: {
                display: true,
                position: "left",
                labels: {
                    color: theme.palette.primary.main,
                },
            }
        },
        scales: {
        },

    }

    // options for line chart
    const optionsLine: any = {
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    color: theme.palette.primary.main,
                },
            }
        },

        xaxes: {
            display: true,
            color: theme.palette.primary.main,

        },
        yaxes: {
            display: true,
            color: theme.palette.primary.main,
        },
            
    }



    return (
        <>
            <Grid item xs={12} md={8} sx={{ width: "100%" }}>
                <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
                    <Chart type="line" data={allOrderChart} options={optionsLine} />
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2}} variant="outlined">
                    <Typography variant="h6">Payment Method</Typography>
                    <Chart type="doughnut" data={top5SalesPercentageChart} options={options} />
                </Paper>
            </Grid>

        </>
    );
}


