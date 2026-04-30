import { useQuery } from '@tanstack/react-query';
import API from '../api';

export const useOrders = () => {
    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            // Matches router.get("/orders/my", getMyOrders)
            const { data } = await API.get('/orders/my');
            return data.orders;
        },
    });
};