import React from "react";
import RoutesComponent from "./Routes";
import ErrorBoundary from "../components/ErrorBoundary";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "../theme";
import { useTheme } from "../hooks/useTheme";
import { NotificationProvider } from "../hooks/useNotification";
import { AuthProvider } from "../hooks/useAuth";
import { ForumProvider } from "../hooks/useForum";
import { CategoryProvider } from "../hooks/useCategory";
import { ProductProvider } from "../hooks/useProduct";
import { DiscountProvider } from "../hooks/useDiscount";
import { OrderProvider } from "../hooks/useOrder";
import { CustomerProvider } from "../hooks/useCustomer";
import { SalesProvider } from "../hooks/useSales";
import { MarketProvider } from "../hooks/useMarket";
import { FarmerProvider } from "../hooks/useFarmer";



function CombinedComponent() {

    const { darkMode } = useTheme();

    const mode = React.useMemo(() => {
        return darkMode ? darkTheme : lightTheme;
    }, [darkMode]);

    return (
        <ThemeProvider theme={mode}>
            <CssBaseline />
            <ErrorBoundary>
                <SnackbarProvider
                    maxSnack={3}
                    preventDuplicate
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <NotificationProvider>
                        <AuthProvider>
                        <MarketProvider>
                            <ForumProvider>
                                <CategoryProvider>
                                    <ProductProvider>
                                        <DiscountProvider>
                                            <OrderProvider>
                                                <CustomerProvider>
                                                    <SalesProvider>
                                                       <FarmerProvider>
                                                        <RoutesComponent />
                                                        </FarmerProvider>
                                                    </SalesProvider>
                                                </CustomerProvider>
                                            </OrderProvider>
                                        </DiscountProvider>
                                    </ProductProvider>
                                </CategoryProvider>
                              </ForumProvider>
                            </MarketProvider>
                        </AuthProvider>
                    </NotificationProvider>
                </SnackbarProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}


export default CombinedComponent;