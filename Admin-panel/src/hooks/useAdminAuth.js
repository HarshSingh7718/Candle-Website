import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate(); // 👉 Added for redirection

    return useMutation({
        mutationFn: async () => {
            // 👉 Hits your backend to clear the HttpOnly cookie. 
            // (Double-check that '/auth/user/logout' is your correct admin route!)
            await api.post('/auth/user/logout');
        },
        onSuccess: () => {
            // 1. Remove the frontend wristband
            localStorage.removeItem("adminAuthenticated");

            // 2. Clear all TanStack queries (purges sensitive cached data from memory)
            queryClient.clear();

            // 3. Show success message
            toast.success("Logged out successfully");

            // 4. Redirect to login page
            navigate('/');
        },
        onError: () => {
            // 👉 CRITICAL FALLBACK: 
            // If the server fails or network drops, force log them out locally anyway.
            // We don't want an admin trapped in the dashboard!
            localStorage.removeItem("adminAuthenticated");
            queryClient.clear();
            navigate('/');
        }
    });
};