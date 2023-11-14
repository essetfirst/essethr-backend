// import react-router-dom components
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// import layout components
import MainLayout from '../pages/layout/MainLayout';
import PrivateRoute from './PrivateRoute';
import NotFound from '../components/404';

// import pages
import SignIn from '../pages/auth/Login';
import SignUp from '../pages/auth/Register';

import Dashboard from '../pages/dashboard';
import DashboardContent from '../pages/layout/DashboardLayout/Dashboard';

import CustomerList from '../pages/customers';
import CustomerDetail from "../pages/customers/CategoryDetail";

import FarmerList from "../pages/farmer";
import FarmerDetail from "../pages/farmer/CategoryDetail";

import CategoriesList from '../pages/categories';
import CategoryDetail from '../pages/categories/CategoryDetail';

import ForumList from '../pages/forum';
import ForumDetail from '../pages/forum/CategoryDetail';

import ProductList from '../pages/products';
import ProductsDetail from '../pages/products/ProductDetail';

import DiscountList from '../pages/discounts';

import OrderList from '../pages/orders';
import OrderDetail from '../pages/orders/OrderDetail';

import SaleList from '../pages/sales';
import SalesDetail from '../pages/sales/SalesDetail';

import Market from "../pages/market";
import MarketDetail from "../pages/market/SalesDetail";

import ReportList from '../pages/report';
import OrderReport from '../pages/report/OrderReport';
import SalesReport from '../pages/report/SalesReport';
import StokeAlert from '../pages/report/StokeAlert';

import Settings from '../pages/settings';
import Profile from '../pages/profile';
import ReportsList from "../pages/reports";
import ReportsDetail from "../pages/reports/CategoryDetail";


const RoutesComponent = () => {
    return (
      <Routes>
        <Route path="/auth" element={<MainLayout />}>
          <Route path="login" element={<SignIn />} />
          <Route path="register" element={<SignUp />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to="/app/dashboard" />} />
          <Route path="app" element={<DashboardContent />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="news" element={<Outlet />}>
              <Route index element={<CategoriesList />} />
              <Route path=":id" element={<CategoryDetail />} />
            </Route>
            <Route path="users" element={<Outlet />}>
              <Route path="1" element={<CustomerList />} />
              <Route path="2" element={<CustomerList />} />
              <Route path="1/:id" element={<CustomerDetail />} />
              <Route path="2/:id" element={<CustomerDetail />} />
            </Route>
            <Route path="books" element={<Outlet />}>
              <Route index element={<ProductList />} />
              <Route path=":id" element={<ProductsDetail />} />
            </Route>
            <Route path="discounts" element={<DiscountList />} />
            <Route path="videos" element={<Outlet />}>
              <Route index element={<OrderList />} />
              <Route path=":id" element={<OrderDetail />} />
            </Route>
            <Route path="forums" element={<Outlet />}>
              <Route index element={<ForumList />} />
              <Route path=":id" element={<ForumDetail />} />
            </Route>
            <Route path="treatments" element={<Outlet />}>
              <Route index element={<SaleList />} />
              <Route path=":id" element={<SalesDetail />} />
            </Route>
            <Route path="markets" element={<Outlet />}>
              <Route path="1" index element={<Market />} />
              <Route path="2" index element={<Market />} />
            </Route>
            <Route path="farmers" element={<Outlet />}>
              <Route index element={<FarmerList />} />
              <Route path=":id" element={<FarmerDetail />} />
            </Route>
            <Route path="reports" element={<Outlet />}>
              <Route path="complex"  element={<ReportsList />} />
              <Route path="all"  element={<ReportsList />} />
              <Route path="complex/:selectType/:id"   element={<ReportsDetail />} />
              <Route path="all/:selectType/:id"  element={<ReportsDetail />} />
            </Route>
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
};


export default RoutesComponent;