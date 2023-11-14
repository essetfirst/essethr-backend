import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getSales, createSale, updateSale, deleteSale, getAllReport, getReportByWeek } from "../../api/salesApi";
import { useNotification } from '../useNotification';

export const SalesContext = createContext({} as any);


export const SalesProvider = ({ children }: any) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification()

    const { data: sales, isLoading, error } = useQuery('sales', getSales);

    const { data: report } = useQuery('report', getAllReport);

    const { data: reportByWeek } = useQuery('reportByWeek', getReportByWeek);


    const { mutate: createSaleMutation } = useMutation(createSale, {
        onSuccess: () => {
            queryClient.invalidateQueries('sales');
            showNotification('Treatment Added successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message, 'error')
        }

    });

    const { mutate: updateSaleMutation } =
        useMutation((data: any) => updateSale(data.id, data), {
            onSuccess: () => {
                queryClient.invalidateQueries('sales');
                showNotification('Treatment Approved successfully', 'success')
            },

            onError: (error: any) => {
                showNotification(error.message.response.data.message, 'error')
            }
        });


    const { mutate: deleteSaleMutation } = useMutation(deleteSale, {
        onSuccess: () => {
            queryClient.invalidateQueries('sales');
            showNotification('Treatment deleted successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message.response.data.message, 'error')
        }
    });



    const value = {
        sales,
        report,
        isLoading,
        error,
        reportByWeek,
        createSaleMutation,
        updateSaleMutation,
        deleteSaleMutation,
    };

    return (
        <SalesContext.Provider value={value}>
            {children}
        </SalesContext.Provider>
    )
}


export const useSales = () => useContext(SalesContext);
