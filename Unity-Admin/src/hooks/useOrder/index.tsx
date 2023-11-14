import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getOrders, createOrder, updateOrder, deleteOrder, approveOrder } from "../../api/ordersApi";
import { useNotification } from '../useNotification';


export const OrderContext = createContext({} as any);

export const OrderProvider = ({ children }: any) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification()

    const { data: orders, isLoading, error } = useQuery('orders', getOrders);

    console.log(" Orders L =  ", orders);

    const { mutate: createOrderMutation } = useMutation(createOrder, {
        onSuccess: () => {
            queryClient.invalidateQueries('orders');
            showNotification('Video created successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message, 'error')
        }

    });

    const { mutate: updateOrderMutation } =
        useMutation((data: any) => updateOrder(data.id, data), {
            onSuccess: () => {
                queryClient.invalidateQueries('orders');
                showNotification('Video Status Changed successfully', 'success')
            },

            onError: (error: any) => {
                showNotification(error.message.response.data.message, 'error')
            }
        });

    const { mutate: approveOrderMutation } =
        useMutation((id: any) => approveOrder(id), {
            onSuccess: () => {
                queryClient.invalidateQueries('orders');
                showNotification('Video approved successfully', 'success')
            },

            onError: (error: any) => {
                showNotification(error.message, 'error')
            }
        });

    const { mutate: deleteOrderMutation } = useMutation(deleteOrder, {
        onSuccess: () => {
            queryClient.invalidateQueries('orders');
            showNotification('Video deleted successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message.response.data.message, 'error')
        }
    });

    const value = {
        orders,
        isLoading,
        error,
        createOrderMutation,
        updateOrderMutation,
        deleteOrderMutation,
        approveOrderMutation
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => useContext(OrderContext);
