import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useGetOrders = (page = 1, limit = 10, status = 'All') => {
    return useQuery({
        queryKey: ['orders', page, limit, status],
        queryFn: async () => {
            let url = `/admin/orders?page=${page}&limit=${limit}`;
            // Only append the status query if it's not "All"
            if (status && status !== 'All') {
                url += `&status=${status}`;
            }
            const { data } = await api.get(url);
            return data;
        }
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await api.put(`/admin/orders/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
            toast.success("Order status updated & SMS sent!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update order status")
    });
};