import { useEffect, useState } from "react";
import TotalItem from "./TotalItemCard";
import TotalOrder from "./TotalOrderCard";
import TotalIncome from "./TotalIncome";
import TotalCustomer from "./TotalCustomer";
import RecentOrder from "./ResentOrder";
import { Container, Grid, Typography } from "@mui/material";
import Page from "../../components/Page";
import IncomeAreaChart from "./IncomeAreaChart";
import { useProduct } from "../../hooks/useProduct";
import { useOrder } from "../../hooks/useOrder";
import { useCustomer } from "../../hooks/useCustomer";
import { useSales } from "../../hooks/useSales";
import PageView from "../../components/PageView";
import LoadingComponent from "../../components/LoadingComponent";
import { useCategory } from "../../hooks/useCategory";


const Dashboard = () => {
  const gridSpacing: number = 3;
  const { products } = useProduct();
  const { orders } = useOrder();
  const { customers } = useCustomer();
  const { categories } = useCategory();
  const { report, reportByWeek, isLoading } = useSales();


  
  var totalSalesMoneyFormat = new Intl.NumberFormat("en-US", {
    // style: "currency",
    // currency: "INR",
  }).format(products?.result || 0);
  
  
  if (isLoading) {
    console.log(" Orders oading L- ",orders);

    <PageView title="Dashboard">
      <LoadingComponent />
    </PageView>
  }
  
  if (!products || !orders || !customers || !report || !reportByWeek) {
    <PageView title="Dashboard">
      <LoadingComponent />
    </PageView>
  }
  
  console.log(" Customers - ",customers);


  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Dashboard
        </Typography>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item lg={4} md={6} sm={6} xs={12}>
                <TotalItem totalItem={categories?.result?.length || 0} />
              </Grid>
              <Grid item lg={4} md={6} sm={6} xs={12}>
                <TotalOrder totalOrder={orders?.result?.length || 0} />
              </Grid>
              <Grid item lg={4} md={12} sm={12} xs={12}>
                <Grid container spacing={1.5}>
                  <Grid item sm={6} xs={12} md={6} lg={12}>
                    <TotalIncome totalSales={products?.result?.length || 0} />
                  </Grid>
                  <Grid item sm={6} xs={12} md={6} lg={12}>
                    <TotalCustomer totalCustomer={customers?.result?.length || 0} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12} md={8}>
                <IncomeAreaChart reportByWeek={reportByWeek?.weeklySalesReport || []} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={gridSpacing}>
                  <Grid item xs={12}>
                    <RecentOrder orders={orders || []} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default Dashboard;
