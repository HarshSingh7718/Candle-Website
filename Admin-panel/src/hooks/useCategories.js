
import { api } from '../api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export const useGetCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            // Make sure this route exists on your backend!
            const { data } = await api.get('/admin/categories');
            return data.categories;
        }
    });
};

export const useGetCategory = (id) => {
    return useQuery({
        queryKey: ['category', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/category/${id}`);
            return data.category;
        },
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await api.post('/admin/category', formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success("Category created successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to create category")
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            const { data } = await api.put(`/admin/category/${id}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            queryClient.invalidateQueries(['category']);
            toast.success("Category updated successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update category")
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/admin/category/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success("Category deleted successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to delete category")
    });
};

export const useToggleCategoryStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.patch(`/admin/category/${id}/toggle`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success("Category status updated!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update status")
    });
};