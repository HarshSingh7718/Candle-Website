import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';

export const useCheckout = () => {
    const queryClient = useQueryClient();

    // 1. Create the final order in the database
    const createOrderMutation = useMutation({
        mutationFn: async (orderPayload) => {
            // Matches: router.post("/order", createOrder)
            const { data } = await API.post('/order', orderPayload);
            return data;
        },
        onSuccess: () => {
            // The backend clears the cart on success, so we sync the frontend!
            queryClient.setQueryData(['cart'], []);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });

    // 2. Initialize Razorpay (Get the order ID from Razorpay)
    const initRazorpayMutation = useMutation({
        mutationFn: async (payload) => {
            // Matches: router.post("/create-order", createRazorpayOrder)
            const { data } = await API.post('/payment/create-order', payload);
            return data;
        }
    });

    // 3. Verify Razorpay Signature
    const verifyPaymentMutation = useMutation({
        mutationFn: async (payload) => {
            // Matches: router.post("/verify", verifyPayment)
            const { data } = await API.post('/payment/verify', payload);
            return data;
        }
    });

    return {
        createOrder: createOrderMutation.mutateAsync,
        isPlacingOrder: createOrderMutation.isPending,
        initRazorpay: initRazorpayMutation.mutateAsync,
        verifyPayment: verifyPaymentMutation.mutateAsync,
    };
};