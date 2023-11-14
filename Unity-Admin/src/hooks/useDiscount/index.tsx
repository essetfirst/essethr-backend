import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getDiscounts, getDiscount, createDiscount, updateDiscount, deleteDiscount } from "../../api/discountApi";
import { useNotification } from '../useNotification';


export const DiscountContext = createContext({} as any);

export const DiscountProvider = ({ children }: any) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification()

    const { data: discounts, isLoading, error } = useQuery('discounts', getDiscounts);

    const { mutate: createDiscountMutation } = useMutation(createDiscount, {
        onSuccess: () => {
            queryClient.invalidateQueries('discounts');
            showNotification('Discount created successfully', 'success')
        },
        
        onError: (error: any) => {
            showNotification(error.message, 'error')
        }

    });

    const { mutate: updateDiscountMutation } =
        useMutation((data: any) => updateDiscount(data.id, data), {
            onSuccess: () => {
                queryClient.invalidateQueries('discounts');
                showNotification('Discount updated successfully', 'success')
            },

            onError: (error: any) => {
                showNotification(error.message.response.data.message, 'error')
            }
        });

    const { mutate: deleteDiscountMutation } = useMutation(deleteDiscount, {
        onSuccess: () => {
            queryClient.invalidateQueries('discounts');
            showNotification('Discount deleted successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message.response.data.message, 'error')
        }
    });

    const value = {
        discounts,
        isLoading,
        error,
        createDiscountMutation,
        updateDiscountMutation,
        deleteDiscountMutation,
    };

    return (
        <DiscountContext.Provider value={value}>
            {children}
        </DiscountContext.Provider>
    );
};

export const useDiscount = () => useContext(DiscountContext);

