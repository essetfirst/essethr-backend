import React from "react";
import { Chart } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { useSales } from "../../hooks/useSales";
import { Typography, Paper, Container, Box, Chip } from "@mui/material";
import LoadingComponent from "../../components/LoadingComponent";
import PageView from "../../components/PageView";
import { colors } from "@mui/material";

import { Chart as ChartJS, registerables } from 'chart.js';
import Grid from "@mui/material/Grid";
ChartJS.register(...registerables);



// show the sales report in a bar chart
export default function SalesChart() {
    const theme = useTheme();
    const { report, isLoading, error } = useSales();

    if (isLoading)
        return (
            <PageView title="Sales Report">
                <LoadingComponent />
            </PageView>
        );

    if (error)
        return (
            <PageView title="Sales Report">
                <Typography variant="h6" color="error">
                    {error.message}
                </Typography>
            </PageView>
        );

    if (!report)
        return (
            <PageView title="Sales Report">
                <Typography variant="h6" color="error">
                    No data found
                </Typography>
            </PageView>
        );

    // draw a line chart for top 5 sales
    const totalSales = report.TotalSales;
    const top5Sales = report.allReport.slice(0, 5);
    const top5SalesLabels = top5Sales.map((sale: any) => sale.name);
    const top5SalesData = top5Sales.map((sale: any) => sale.itemSales);

    const top5SalesChart = {
        labels: top5SalesLabels,
        datasets: [
            {
                label: "Top 5 Sales",
                data: top5SalesData,
                backgroundColor: colors.teal[500],
                borderColor: colors.teal[500],
            },
        ],
    };

    const top5SalesPercentage = top5Sales.map((sale: any) => {
        return (sale.itemSales / totalSales) * 100;
    });

    const top5SalesPercentageChart = {
        labels: top5SalesLabels,
        datasets: [
            {
                label: "Top 5 Sales Percentage",
                data: top5SalesPercentage,
                backgroundColor: [
                    colors.teal[500],
                    colors.purple[500],
                    colors.blue[500],
                    colors.indigo[500],
                    colors.yellow[900],
                ],
                cutout: "50%",
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
        }
    }

    const options2: any = {
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    color: theme.palette.primary.main,
                },
            }
        }
    }



    return (
        <>
            <Grid item xs={12} md={8} >
                <Paper sx={{ p: 2, mb: 2, height: "100%" }} variant="outlined">
                    <Chart type="line" data={top5SalesChart} options={options2} />
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2, height: "100%" }} variant="outlined">
                    <Typography variant="h6">Top 5 Sales</Typography>
                    <Chart type="doughnut" data={top5SalesPercentageChart} options={options} />
                </Paper>
            </Grid>
        </>
    );
}

