import { Typography, Paper, Container, Box, Chip, colors } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LoadingComponent from "../../components/LoadingComponent";
import { useSales } from "../../hooks/useSales";
import PageView from "../../components/PageView";
import moment from "moment";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import { Grid } from "@mui/material";
import SalesChart from "./SalesChart";

export default function SalesReport() {
  const theme = useTheme();
  const { report, isLoading, error } = useSales();

  if (isLoading)
    <PageView title="Sales Report">
      <LoadingComponent />
    </PageView>;

  if (error)
    <PageView title="Sales Report">
      <Typography variant="h6" color="error">
        {error.message}
      </Typography>
    </PageView>;

  if (!report)
    return (
      <PageView title="Sales Report">
        <Typography variant="h6" color="error">
          No data found
        </Typography>
      </PageView>
    );

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 150,
    },
    {
      field: "description",
      headerName: "Description",
      width: 150,
    },
    {
      field: "salesDate",
      headerName: "Sales Date",
      width: 200,
      renderCell: (params: any) => {
        return <>{moment(params.value).format("MMMM Do YYYY")}</>;
      },
    },
    {
      field: "items",
      headerName: "Number of items sold",
      width: 150,
      renderCell: (params: any) => {
        return (
          <>
            <Typography variant="h5">
              {params.value.map((item: any) => item.quantity).reduce(
                (a: any, b: any) => a + b,
                0
              )}
            </Typography>
          </>
        );
      },
    },
    {
      field: "itemSales",
      headerName: "Total price",
      width: 200,
      renderCell: (params: any) => {
        return (
          <>
            <Typography variant="h5" sx={{ color: colors.teal[500] }}>
              {params.value.toLocaleString("en-US", {
                style: "currency",
                currency: "ETB",
              })}
            </Typography>
          </>
        );
      },
    },
  ];

  const rows: GridRowsProp = report?.allReport?.map((sale: any) => {
    return {
      id: sale._id,
      name: sale.name,
      customer: sale.customer.fullName,
      description: sale.description,
      salesDate: sale.salesDate,
      items: sale.items,
      itemSales: sale.itemSales,
    };
  });


  let totalSales = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
  }).format(report?.TotalSales);


  return (
    <PageView title="Sales Report" backPath="/dashboard">
      <Container maxWidth="lg">
        <Grid container spacing={1}>
            <SalesChart />
          <Grid item xs={12} md={12}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Chip
                  label={`Total Sales: ${totalSales}`}
                  sx={{ fontSize: 14, mr: 1, color: theme.palette.info.main }}

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
