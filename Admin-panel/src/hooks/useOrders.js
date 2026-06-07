import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';


export const useGetOrderDetails = (id) => {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['order', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/orders/${id}`);
            return data.order;
        },
        enabled: !!id,
    });
};

export const useGetOrders = (page = 1, limit = 10, status = 'All') => {
    return useQuery({
        placeholderData: keepPreviousData,
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
        // 👉 Destructure the new logistics fields
        mutationFn: async ({ id, status, packaging, weight }) => {
            const { data } = await api.put(`/admin/orders/${id}/update`, {
                status,
                packaging,
                weight
            });
            return data;
        },
        onSuccess: () => {
            // 👉 Invalidate both the master list AND the single order detail views
            queryClient.invalidateQueries(['orders']);
            queryClient.invalidateQueries(['order']);
            toast.success("Order status updated!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update order status")
    });
};
export const useGetAvailableCouriers = (id, enabled = true) => {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['order-couriers', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/orders/${id}/couriers`);
            return data.couriers;
        },
        enabled: !!id && enabled,
    });
};

export const useShipOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, courierId, pickupDate }) => {
            const { data } = await api.post(`/admin/orders/${id}/ship`, {
                courierId,
                pickupDate
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
            queryClient.invalidateQueries(['order']);
            toast.success("Shipping initiated successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to initiate shipping")
    });
};
