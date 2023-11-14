import React from 'react'
import PageView from "../../components/PageView";
import moment from "moment";
import { Typography, Paper, Container, Box, Chip, colors } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LoadingComponent from "../../components/LoadingComponent";
import { useOrder } from '../../hooks/useOrder';
import { Grid } from "@mui/material";
import OrderChart from './OrderChart';
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";



export default function OrderReport() {
  const theme = useTheme();
  const { report, isLoading, error } = useOrder();

  if (isLoading)
    <PageView title="Order Report">
      <LoadingComponent />
    </PageView>;

  if (error)
    <PageView title="Order Report">
      <Typography variant="h6" color="error">
        {error.message}
      </Typography>
    </PageView>;


  if (!report)
    return (
      <PageView title="Order Report">
        <Typography variant="h6" color="error">
          No data found
        </Typography>
      </PageView>
    );


  const columns: GridColDef[] = [
    {
      field: "orderOwnerInfo",
      headerName: "Order Owner",
      width: 150,
      renderCell: (params: any) => {
        return (
          <Typography variant="body2">
            {params.row.orderOwnerInfo.fullName}
          </Typography>
        )
      }

    },
    {
      field: "orderDate",
      headerName: "Order Date",
      width: 200,
      renderCell: (params: any) => {
        return (
          <Typography variant="h6">
            {moment(params.row.orderDate).format("DD-MM-YYYY")}
          </Typography>
        )
      }
    },
    {
      field: "paymentMethod",
      headerName: "Payment Method",
      width: 150,
    },
    {
      field: "items",
      headerName: "Total Items Ordered",
      width: 150,
      renderCell: (params: any) => {
        return (
          <Typography variant="body2">
            {params.value.map((item: any) => item.quantity).reduce(
              (a: any, b: any) => a + b,
              0
            )}
          </Typography>

        )
      }
    },
    {
      field: "itemOrders",
      headerName: "Total Orders",
      width: 150,
      renderCell: (params: any) => {
        return (
          <Typography variant="body2" color="teal">
            {params.value.toLocaleString("en-US", {
              style: "currency",
              currency: "ETB",
            })}
          </Typography>
        )
      }
    },
  ];

  const rows: GridRowsProp = report?.allReport.map((item: any) => {
    return {
      id: item._id,
      orderOwnerInfo: item.orderOwnerInfo,
      orderDate: item.orderDate,
      paymentMethod: item.paymentMethod,
      items: item.items,
      itemOrders: item.itemOrders,
    }
  }
  );
  const price: any = Object.values(report)[1]

  let totalSales = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
  }).format(price)


  return (
    <PageView title="Order Report" backPath="/report">
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <OrderChart />
          <Grid item xs={12}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h5" sx={{ color: theme.palette.primary.main }}>
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Chip
                  label={`Total Sales: ${totalSales}`}
                  sx={{ fontSize: 12, mr: 1, color: theme.palette.info.main }}

                />
              </Box>
            </Box>
            <Box sx={{ height: 20 }} />
            <Paper sx={{ background: theme.palette.background.paper }} variant="outlined">
              <DataGrid
                rows={rows}
                columns={columns}
                autoHeight
                pagination
                rowsPerPageOptions={[5, 10, 20]}
                checkboxSelection
                initialState={{
                  pagination: {
                    pageSize: 10,
                  },
                }}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </PageView>
  );
}
