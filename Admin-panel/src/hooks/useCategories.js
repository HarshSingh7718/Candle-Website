
import { api } from '../api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
export const useGetCategories = () => {
    return useQuery({
        placeholderData: keepPreviousData,
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
        placeholderData: keepPreviousData,
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

export const useGetCategoryProducts = (categoryId) => {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['categoryProducts', categoryId],
        queryFn: async () => {
            const { data } = await api.get(`/admin/category/${categoryId}/products`);
            return data;
        },
        enabled: !!categoryId,
    });
};

export const useUpdateCategoryProducts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ categoryId, productIds }) => {
            const { data } = await api.put(`/admin/category/${categoryId}/products`, { productIds });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['categoryProducts', variables.categoryId]);
            // Also invalidate general products list since category assignments changed
            queryClient.invalidateQueries(['products']);
            toast.success("Products assigned successfully!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to assign products")
    });
};