import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useGetProducts = (page = 1, limit = 10, search = '', activeTab = 'All Products') => {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['products', page, limit, search, activeTab],
        queryFn: async () => {
            let url = `/admin/products?page=${page}&limit=${limit}`;
            if (search) url += `&search=${search}`;
            if (activeTab === 'Low Stock') url += `&lowStock=true`;
            if (activeTab === 'Drafts') url += `&inactive=true`;
            
            const { data } = await api.get(url);
            return data;
        }
    });
};

export const useGetProduct = (id) => {
    return useQuery({
        placeholderData: keepPreviousData,
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