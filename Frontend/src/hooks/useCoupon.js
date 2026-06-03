import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';

/**
 * useCoupon
 *
 * Manages the applied coupon state for the checkout flow.
 * Exposes: applyCoupon, removeCoupon, appliedCoupon, discountAmount, isApplying
 */
export const useCoupon = () => {
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const applyMutation = useMutation({
        mutationFn: async (code) => {
            const { data } = await API.post('/coupons/apply', { code });
            return data;
        },
        onSuccess: (data) => {
            setAppliedCoupon(data.coupon);
            setDiscountAmount(data.discountAmount);
            toast.success(data.message || 'Coupon applied!');
        },
        onError: (error) => {
            setAppliedCoupon(null);
            setDiscountAmount(0);
            toast.error(error.response?.data?.message || 'Invalid coupon code');
        }
    });

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        toast.success('Coupon removed');
    };

    return {
        applyCoupon: (code) => applyMutation.mutate(code),
        removeCoupon,
        appliedCoupon,
        discountAmount,
        isApplying: applyMutation.isPending,
    };
};
