import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';
import { useCart } from './useCart';

const APPLIED_COUPON_KEY = "naisha_applied_coupon";

export const useCoupon = () => {
  const queryClient = useQueryClient();
  const { cart, billing } = useCart();

  // 1. Shared Applied Coupon State in React Query Cache
  const { data: appliedCoupon = null } = useQuery({
    queryKey: ['appliedCoupon'],
    queryFn: () => {
      try {
        const stored = sessionStorage.getItem(APPLIED_COUPON_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // 2. Fetch Available Coupons (Server calculates ranking & eligibility based on cart items)
  const {
    data: availableCoupons = [],
    isLoading: isLoadingCoupons,
    refetch: refetchCoupons,
  } = useQuery({
    queryKey: ['availableCoupons', billing?.itemsPrice, cart?.length],
    queryFn: async () => {
      const { data } = await API.get(`/coupons/available?subtotal=${billing?.itemsPrice || 0}`);
      return data.coupons || [];
    },
  });

  // 3. Auto-revalidate applied coupon on cart mutations (add/remove items)
  useEffect(() => {
    if (!appliedCoupon?.code) return;

    if (!cart || cart.length === 0) {
      sessionStorage.removeItem(APPLIED_COUPON_KEY);
      queryClient.setQueryData(['appliedCoupon'], null);
      toast.error('Coupon removed: Cart is empty');
      return;
    }

    let isMounted = true;
    API.post('/coupons/apply', {
      code: appliedCoupon.code,
      subtotal: billing?.itemsPrice || 0,
      items: cart,
    })
      .then(({ data }) => {
        if (!isMounted) return;
        const updatedObj = {
          _id: data.coupon._id,
          code: data.coupon.code,
          title: data.coupon.title,
          description: data.coupon.description,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          maxDiscountAmount: data.coupon.maxDiscountAmount,
          applicableCollections: data.coupon.applicableCollections,
          discountAmount: data.discountAmount,
          eligibleSubtotal: data.eligibleSubtotal,
        };
        sessionStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(updatedObj));
        queryClient.setQueryData(['appliedCoupon'], updatedObj);
      })
      .catch((err) => {
        if (!isMounted) return;
        sessionStorage.removeItem(APPLIED_COUPON_KEY);
        queryClient.setQueryData(['appliedCoupon'], null);
        toast.error(`Coupon removed: ${err.response?.data?.message || 'Requirements no longer met'}`);
      });

    return () => {
      isMounted = false;
    };
  }, [cart, billing?.itemsPrice, appliedCoupon?.code, queryClient]);

  // 4. Dynamic discount amount from appliedCoupon state
  const discountAmount = appliedCoupon?.discountAmount || 0;

  // 5. Apply Coupon Mutation — Updates shared React Query cache & sessionStorage
  const applyMutation = useMutation({
    mutationFn: async (code) => {
      const { data } = await API.post('/coupons/apply', { code, subtotal: billing?.itemsPrice || 0, items: cart });
      return data;
    },
    onSuccess: (data) => {
      const couponObj = {
        _id: data.coupon._id,
        code: data.coupon.code,
        title: data.coupon.title,
        description: data.coupon.description,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
        maxDiscountAmount: data.coupon.maxDiscountAmount,
        applicableCollections: data.coupon.applicableCollections,
        discountAmount: data.discountAmount,
        eligibleSubtotal: data.eligibleSubtotal,
      };
      sessionStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(couponObj));
      queryClient.setQueryData(['appliedCoupon'], couponObj);
      toast.success(data.message || 'Coupon applied!');
    },
    onError: (error) => {
      sessionStorage.removeItem(APPLIED_COUPON_KEY);
      queryClient.setQueryData(['appliedCoupon'], null);
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    },
  });

  // 6. Remove Coupon — Clears shared React Query cache & sessionStorage
  const removeCoupon = () => {
    sessionStorage.removeItem(APPLIED_COUPON_KEY);
    queryClient.setQueryData(['appliedCoupon'], null);
    toast.success('Coupon removed');
  };

  // Find best coupon (top ranked eligible coupon with highest discountAmount)
  const bestCoupon = availableCoupons.find((c) => c.isEligible && c.isBest);

  return {
    applyCoupon: (code) => applyMutation.mutate(code),
    removeCoupon,
    appliedCoupon,
    discountAmount: appliedCoupon ? discountAmount : 0,
    isApplying: applyMutation.isPending,
    availableCoupons,
    isLoadingCoupons,
    bestCoupon,
    refetchCoupons,
  };
};
