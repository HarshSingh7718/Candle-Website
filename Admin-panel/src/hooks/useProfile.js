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

/**
 * useRequestPhoneOtp — Admin: Sends OTP to a new phone number.
 */
export const useRequestPhoneOtp = () => {
    return useMutation({
        mutationFn: async (newPhoneNumber) => {
            const { data } = await api.post('/user/profile/request-phone-otp', { newPhoneNumber });
            return data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "OTP sent to your new phone number!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to send OTP.");
        }
    });
};

/**
 * useVerifyPhoneUpdate — Admin: Verifies OTP and updates the phone number.
 */
export const useVerifyPhoneUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ newPhoneNumber, otp }) => {
            const { data } = await api.put('/user/profile/phone', { newPhoneNumber, otp });
            return data;
        },
        onSuccess: (data) => {
            if (data.user) {
                queryClient.setQueryData(['adminProfile'], data.user);
            } else {
                queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
            }
            toast.success(data.message || "Phone number updated successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Verification failed.");
        }
    });
};
