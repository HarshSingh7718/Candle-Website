import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useGetProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            // Adding limit=100 just to fetch a good chunk without pagination for now
            const { data } = await api.get('/admin/products?limit=100');
            return data.products;
        }
    });
};

export const useGetProduct = (id) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/product/${id}`);
            return data.product;
        },
        enabled: !!id,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await api.post('/admin/product', formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success("Product created successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to create product")
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            const { data } = await api.put(`/admin/product/${id}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['product']);
            toast.success("Product updated successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update product")
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/admin/product/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success("Product deleted successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to delete product")
    });
};

export const useToggleProductStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.patch(`/admin/product/${id}/toggle-status`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success("Status updated!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update status")
    });
};