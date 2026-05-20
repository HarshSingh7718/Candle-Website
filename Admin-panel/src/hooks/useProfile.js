import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useAdminProfile = () => {
    return useQuery({
        queryKey: ['adminProfile'],
        queryFn: async () => {
            const { data } = await api.get('/user/profile');
            return data.user;
        },
        refetchOnWindowFocus: false,
    });
};

export const useUpdateAdminProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userData) => {
            const { data } = await api.put('/user/profile', userData);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['adminProfile'], data.user);
            toast.success("Profile updated successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    });
};

export const useChangeAdminPassword = () => {
    return useMutation({
        mutationFn: async (passwordData) => {
            const { data } = await api.put('/user/password', passwordData);
            return data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Password changed successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to change password");
        }
    });
};
