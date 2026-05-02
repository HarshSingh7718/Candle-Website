import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

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