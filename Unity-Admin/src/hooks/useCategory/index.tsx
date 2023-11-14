import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../../api/categoryApi';
import { useNotification } from '../useNotification';

export const CategoryContext = createContext({} as any);


export const CategoryProvider = ({ children }: any) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification()

    const { data: categories, isLoading, error } = useQuery('categories', getCategories);

    const { mutate: createCategoryMutation } = useMutation(createCategory, {
        onSuccess: () => {
            queryClient.invalidateQueries('categories');
            showNotification('News created successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message, 'error')
        }

    });

    const { mutate: updateCategoryMutation } =
        useMutation((data: any) => updateCategory(data.id, data), {
            onSuccess: () => {
                queryClient.invalidateQueries('categories');
                showNotification('News updated successfully', 'success')
            },

            onError: (error: any) => {
                showNotification(error.message.response.data.message, 'error')
            }
        });


    const { mutate: deleteCategoryMutation } = useMutation(deleteCategory, {
        onSuccess: () => {
            queryClient.invalidateQueries('categories');
            showNotification('News deleted successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message.response.data.message, 'error')
        }
    });

    const value = {
        categories,
        isLoading,
        error,
        createCategoryMutation,
        updateCategoryMutation,
        deleteCategoryMutation,
    };

    return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

export const useCategory = () => useContext(CategoryContext);