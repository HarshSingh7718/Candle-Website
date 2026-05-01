import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api'; // Your configured axios instance
import toast from 'react-hot-toast';

export const useAddress = () => {
    const queryClient = useQueryClient();

    // 1. Add Address
    const addAddressMutation = useMutation({
        mutationFn: async (addressData) => {
            const { data } = await API.post('/address/add', addressData);
            return data;
        },
        onSuccess: () => {
            toast.success("Address saved successfully!");
            // Refresh the user data so the new address appears instantly
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add address");
        }
    });

    // 2. Update Address
    const updateAddressMutation = useMutation({
        mutationFn: async ({ addressId, addressData }) => {
            const { data } = await API.put(`/address/${addressId}`, addressData);
            return data;
        },
        onSuccess: () => {
            toast.success("Address updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update address");
        }
    });

    // 3. Delete Address
    const deleteAddressMutation = useMutation({
        mutationFn: async (addressId) => {
            const { data } = await API.delete(`/address/${addressId}`);
            return data;
        },
        onSuccess: () => {
            toast.success("Address removed");
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete address");
        }
    });

    return {
        addAddress: addAddressMutation.mutateAsync,
        isAdding: addAddressMutation.isPending,

        updateAddress: updateAddressMutation.mutateAsync,
        isUpdating: updateAddressMutation.isPending,

        deleteAddress: deleteAddressMutation.mutateAsync,
        isDeleting: deleteAddressMutation.isPending,
    };
};