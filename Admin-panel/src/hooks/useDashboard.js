import { useQuery } from '@tanstack/react-query';
import { api } from '../api'; // Make sure this path is correct

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            // Adjust this URL if your route is slightly different
            const { data } = await api.get('/admin/dashboard');
            return data.dashboard;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};