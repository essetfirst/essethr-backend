import { createContext, useContext } from 'react';
import {
  getCustomers,
  createCustomer,
  deleteTank,
  getCustomerById,
  getTankById,
  updateCustomer,
  // updateAssistant,
  deleteCustomer,
  // deleteLab,
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

    // const { mutate: updateLabAssistantMutation } = useMutation((data: any) => updateAssistant(data), {
    //     onSuccess: () => {
    //         showNotification(`Lab Assistant status changed  successfully`, 'success');
    //         queryClient.invalidateQueries('customers');
    //     },

    //     onError: (error: any) => {
    //         showNotification('Error updating assistant status', 'error');
    //     }
    // });

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

    // const { mutate: deleteLabAssistantMutation, isLoading: deleteLabLoading } =
    //   useMutation(deleteLab, {
    //     onSuccess: () => {
    //       showNotification("Lab Assistant deleted successfully", "success");
    //       queryClient.invalidateQueries("customers");
    //     },

    //     onError: (error: any) => {
    //       showNotification('Error deleting lab assistant', "error");
    //     },
    //   });  

    return (
      <FarmerContext.Provider
        value={{
          customers,
          isLoading,
          error,
          createCustomerMutation,
          createCustomerLoading,
          updateCustomerMutation,
          // updateLabAssistantMutation,
          deleteCustomerMutation,
          deleteCustomerLoading,
          deleteTankMutation,
          deleteTankLoading,
          // deleteLabLoading,
          // deleteLabAssistantMutation
        }}
      >
        {children}
      </FarmerContext.Provider>
    );
};


export const useFarmer = () => useContext(FarmerContext);
