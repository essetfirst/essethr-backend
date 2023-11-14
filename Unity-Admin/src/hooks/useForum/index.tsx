import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getForums, createForum, updateForum, deleteForum } from "../../api/forumApi";
import { useNotification } from '../useNotification';
import { useParams } from 'react-router-dom';

export const ForumContext = createContext({} as any);

export const ForumProvider = ({ children }: any) => {

    const queryClient = useQueryClient();
    
    const { showNotification } = useNotification()

    const { data: forums, isLoading, error } = useQuery('forums', getForums);

    const { mutate: createForumMutation } = useMutation(createForum, {
        onSuccess: () => {
            queryClient.invalidateQueries('forums');
            showNotification('Forum created successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message, 'error')
        }

    });

    const { mutate: updateForumMutation } =
        useMutation((data: any) => updateForum(data.id, data), {
            onSuccess: () => {
                queryClient.invalidateQueries('forums');
                showNotification('Forum updated successfully', 'success')
            },

            onError: (error: any) => {
                showNotification(error.message.response.data.message, 'error')
            }
        });


    const { mutate: deleteForumMutation } = useMutation(deleteForum, {
        onSuccess: () => {
            queryClient.invalidateQueries('forums');
            showNotification('Forum deleted successfully', 'success')
        },

        onError: (error: any) => {
            showNotification(error.message.response.data.message, 'error')
        }
    });



    const value = {
        forums,
        isLoading,
        error,
        createForumMutation,
        updateForumMutation,
        deleteForumMutation,
    };

    return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
};

export const useForum = () => useContext(ForumContext);




