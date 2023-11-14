import { createContext, useContext } from 'react';
import { getCustomers, createCustomer, getCustomerById, updateCustomer, deleteCustomer } from '../../api/customerApi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNotification } from '../useNotification';

export const CustomerContext = createContext({} as any);


export const CustomerProvider = ({ children }: any) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const { data: customers, isLoading, error } = useQuery('customers', getCustomers);

    const { mutate: createCustomerMutation, isLoading: createCustomerLoading } = useMutation(createCustomer, {
        onSuccess: () => {
            showNotification('Create User successfully', 'success');
            queryClient.invalidateQueries('customers');
        },

        onError: (error: any) => {
            showNotification(error.message, 'error');
        }

    });

    const { mutate: updateCustomerMutation } = useMutation((data: any) => updateCustomer(data?.id), {
        onSuccess: () => {
            showNotification('Approved User successfully', 'success');
            queryClient.invalidateQueries('customers');
        },

        onError: (error: any) => {
            showNotification(error.message, 'error');
        }
    });

    const { mutate: deleteCustomerMutation, isLoading: deleteCustomerLoading } = useMutation(deleteCustomer, {
        onSuccess: () => {
            showNotification('Delete User successfully', 'success');
            queryClient.invalidateQueries('customers');
        },

        onError: (error: any) => {
            showNotification(error.message, 'error');
        }
    });

    return (
        <CustomerContext.Provider
            value={{
                customers,
                isLoading,
                error,
                createCustomerMutation,
                createCustomerLoading,
                updateCustomerMutation,
                deleteCustomerMutation,
                deleteCustomerLoading,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
};


export const useCustomer = () => useContext(CustomerContext);
