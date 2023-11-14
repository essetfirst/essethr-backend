import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = () => {
    // Get authentication state from context
    const { auth } = useAuth();
    const isAuthenticated = auth.isAuthenticated;
    
    // If user is not authenticated, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" />;
    }
    
    // If user is authenticated, render the content of the route
    return <Outlet />;
};

export default PrivateRoute;