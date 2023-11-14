import { useContext, createContext, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, logout } from '../../api/authApi';
import { useNotification } from '../../hooks/useNotification';
import { getInitialState, reducer } from './reducer';

export const AuthContext = createContext({} as any);

export const AuthProvider = ({ children }: any) => {
    const [state, dispatch] = useReducer(reducer, getInitialState());
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    
    const loginAction = async (data: any) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const response = await login(data);
            console.log(" Login Response  ",response)
            dispatch({ type: 'LOGIN_SUCCESS', payload: response });
            const { name } = response?.result?.user
            console.log(name,response,response?.result?.authToken)
            localStorage.setItem('token', response?.result?.authToken);
            localStorage.setItem('user', response?.result?.user);
            navigate('/app/dashboard');
            showNotification('Welcome '+ name , 'info');
        } catch (error: any) {
            dispatch({ type: 'LOGIN_FAILURE', payload: error });
            showNotification("Invalid phone or pin", "error");
        }
    };

    const logoutAction = async () => {
        dispatch({ type: 'LOGOUT_REQUEST' });
        try {
            // const response = await logout();
            dispatch({ type: 'LOGOUT_SUCCESS', payload: '' });
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // localStorage.removeItem('org');
            navigate('/auth/login');
            showNotification('Logged out successfully', 'info');
        } catch (error: any) {
            dispatch({ type: 'LOGOUT_FAILURE', payload: error });
            showNotification('Something went wrong', 'error');
        }
    };


    return (
        <AuthContext.Provider
            value={{
                auth: state,
                loginAction,
                logoutAction,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


