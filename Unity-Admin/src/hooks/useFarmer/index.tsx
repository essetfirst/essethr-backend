import { createContext, useContext } from 'react';
import {
  getCustomers,
  createCustomer,
  deleteTank,
  getCustomerById,
  getTankById,
  updateCustomer,
  deleteCustomer,
} from "../../api/farmerApi";
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNotification } from '../useNotification';

export const FarmerContext = createContext({} as any);


export const FarmerProvider = ({ children }: any) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const { data: customers, isLoading, error } = useQuery('farmers', getCustomers);

    const { mutate: createCustomerMutation, isLoading: createCustomerLoading } = useMutation(createCustomer, {
        onSuccess: () => {
            showNotification('Created Farmer successfully', 'success');
            queryClient.invalidateQueries('customers');
        },

        onError: (error: any) => {
            showNotification(error.message, 'error');
        }

    });

    const { mutate: updateCustomerMutation } = useMutation((data: any) => updateCustomer(data?.id), {
        onSuccess: () => {
            showNotification('Updated Farmer successfully', 'success');
            queryClient.invalidateQueries('customers');
        },

        onError: (error: any) => {
            showNotification(error.message, 'error');
        }
    });

    const { mutate: deleteCustomerMutation, isLoading: deleteCustomerLoading } = useMutation(deleteCustomer, {
        onSuccess: () => {
            showNotification('Deleted Farmer successfully', 'success');
            queryClient.invalidateQueries('customers');
        },

        onError: (error: any) => {
            showNotification(error.message, 'error');
        }
    });
    const { mutate: deleteTankMutation, isLoading: deleteTankLoading } =
      useMutation(deleteTank, {
        onSuccess: () => {
          showNotification("Deleted Tank successfully", "success");
          queryClient.invalidateQueries("customers");
        },

        onError: (error: any) => {
          showNotification(error.message, "error");
        },
      });

    return (
      <FarmerContext.Provider
        value={{
          customers,
          isLoading,
          error,
          createCustomerMutation,
          createCustomerLoading,
          updateCustomerMutation,
          deleteCustomerMutation,
          deleteCustomerLoading,
          deleteTankMutation,
          deleteTankLoading,
        }}
      >
        {children}
      </FarmerContext.Provider>
    );
};


export const useFarmer = () => useContext(FarmerContext);
