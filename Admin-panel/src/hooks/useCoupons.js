import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

// Fetch all coupons
export const useGetCoupons = () => {
    return useQuery({
        queryKey: ['coupons'],
        queryFn: async () => {
            const { data } = await api.get('/admin/coupons');
            return data.coupons;
        }
    });
};

// Fetch a single coupon for the Edit page
export const useGetCoupon = (id) => {
    return useQuery({
        queryKey: ['coupon', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/coupons/${id}`);
            return data.coupon;
        },
        enabled: !!id,
    });
};

// Create a new coupon
export const useCreateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (couponData) => {
            const { data } = await api.post('/admin/coupons', couponData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['coupons']);
            toast.success("Coupon created successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create coupon");
        }
    });
};

// Update an existing coupon
export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, couponData }) => {
            const { data } = await api.put(`/admin/coupons/${id}`, couponData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['coupons']);
            queryClient.invalidateQueries(['coupon']);
            toast.success("Coupon updated successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update coupon");
        }
    });
};

// Toggle coupon active status
export const useToggleCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.patch(`/admin/coupons/${id}/toggle`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['coupons']);
            toast.success("Coupon status updated!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update coupon status");
        }
    });
};

// Delete a coupon
export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/admin/coupons/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['coupons']);
            toast.success("Coupon deleted successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete coupon");
        }
    });
};
