import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

/**
 * useSettings — Fetches the singleton store settings document.
 */
export const useSettings = () => {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['storeSettings'],
        queryFn: async () => {
            const { data } = await api.get('/admin/settings');
            return data.settings;
        },
        refetchOnWindowFocus: false,
    });
};

/**
 * useUpdateSettings — Updates store-wide pricing variables.
 */
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settingsData) => {
            const { data } = await api.put('/admin/settings', settingsData);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['storeSettings'], data.settings);
            toast.success(data.message || "Settings updated successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update settings");
        }
    });
};
