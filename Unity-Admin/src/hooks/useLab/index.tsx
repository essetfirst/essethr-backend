import { createContext, useContext } from 'react';
import {
  getLabs,
  updateAssistant,
  deleteLab,
} from "../../api/labsApi";
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNotification } from '../useNotification';

export const LabsContext = createContext({} as any);


export const LabsProvider = ({ children }: any) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    const { data: labs, isLoading, error } = useQuery('farmers', getLabs);

    const { mutate: updateLabAssistantMutation } = useMutation((data: any) => updateAssistant(data), {
        onSuccess: () => {
            showNotification(`Lab Assistant status changed  successfully`, 'success');
            queryClient.invalidateQueries('labs');
        },

        onError: (error: any) => {
            showNotification('Error updating assistant status', 'error');
        }
    });


    const { mutate: deleteLabAssistantMutation, isLoading: deleteLabLoading } = useMutation(deleteLab, {
        onSuccess: () => {
          showNotification("Lab Assistant deleted successfully", "success");
          queryClient.invalidateQueries("labs");
        },

        onError: (error: any) => {
          showNotification('Error deleting lab assistant', "error");
        },
      });  

    return (
      <LabsContext.Provider
       value={{
          labs,
          isLoading,
          error,
          updateLabAssistantMutation,
          deleteLabLoading,
          deleteLabAssistantMutation
        }}
      >
        {children}
      </LabsContext.Provider>
    );
};


export const useLab = () => useContext(LabsContext);
