import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useAdminLogin = () => {
    return useMutation({
        mutationFn: async (credentials) => {
            // Just make the request. The backend will set the cookie in the browser automatically!
            const { data } = await api.post('/admin/login', credentials);
            return data;
        },
        onSuccess: () => {
            // 👉 Drop the dummy flag for React Router
            localStorage.setItem("adminAuthenticated", "true");
            toast.success("Welcome back, Admin!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Invalid credentials");
        }
    });
};

export const useAdminLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // 👉 CRITICAL GOTCHA: Because the cookie is HttpOnly, frontend JS cannot delete it.
            // You MUST have a route on your backend that runs `res.clearCookie('token')`.
            await api.post('/auth/user/logout');

            // Remove the frontend wristband
            localStorage.removeItem("adminAuthenticated");
        },
        onSuccess: () => {
            queryClient.clear();
            toast.success("Logged out successfully");
        }
    });
};