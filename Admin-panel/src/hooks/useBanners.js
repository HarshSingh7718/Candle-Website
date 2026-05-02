import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

// Create a Banner
export const useCreateBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            // Pass the FormData object directly to Axios
            const { data } = await api.post('/admin/banner', formData);
            return data;
        },
        onSuccess: () => {
            // Refresh the list so the new banner shows up instantly
            queryClient.invalidateQueries(['banners']);
            toast.success("Banner created successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create banner");
        }
    });
};

// Fetch a single banner for the Edit page
export const useGetBanner = (id) => {
    return useQuery({
        queryKey: ['banner', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/banner/${id}`);
            return data.banner;
        },
        enabled: !!id, // Only run the query if we actually have an ID
    });
};

// Fetch all banners
export const useGetBanners = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
            // Adjust the route prefix ('/admin' or '/api/admin') based on your Express setup
            const { data } = await api.get('/admin/banners');
            return data.banners; // Plucking the array from your backend response
        }
    });
};

// Update an existing banner
export const useUpdateBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // We pass an object containing both the ID and the FormData
        mutationFn: async ({ id, formData }) => {
            const { data } = await api.put(`/admin/banner/${id}`, formData);
            return data;
        },
        onSuccess: () => {
            // Invalidate both the list and the single banner cache
            queryClient.invalidateQueries(['banners']);
            queryClient.invalidateQueries(['banner']);
            toast.success("Banner updated successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update banner");
        }
    });
};

// Toggle banner status
export const useToggleBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.patch(`/admin/banner/${id}/toggle`);
            return data;
        },
        onSuccess: () => {
            // Instantly refresh the banners list in the background
            queryClient.invalidateQueries(['banners']);
            toast.success("Banner status updated!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update banner");
        }
    });
};

// Delete a banner
export const useDeleteBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/admin/banner/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
            toast.success("Banner deleted successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete banner");
        }
    });
};