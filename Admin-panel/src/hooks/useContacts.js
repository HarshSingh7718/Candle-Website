import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useGetContacts = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['contacts', page, limit],
        queryFn: async () => {
            const { data } = await api.get(`/admin/contacts?page=${page}&limit=${limit}`);
            return data;
        }
    });
};

export const useUpdateContactStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await api.patch(`/admin/contact/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts']);
            toast.success("Contact status updated!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update status")
    });
};