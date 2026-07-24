import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';
import { useUser } from './useAuth';
import { useNavigate } from 'react-router-dom';
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQuantity,
  removeGuestCartItem,
  clearGuestCart,
} from '../utils/guestCart';

export const useCart = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const navigate = useNavigate();

  // ── Guest Cart State (Listens to window events) ──
  const [guestCartItems, setGuestCartItems] = useState(() => getGuestCart());

  useEffect(() => {
    const handleGuestUpdate = () => {
      setGuestCartItems(getGuestCart());
    };
    window.addEventListener('guest-cart-updated', handleGuestUpdate);
    return () => window.removeEventListener('guest-cart-updated', handleGuestUpdate);
  }, []);

  // 1. Get Full Cart -> GET /api/cart/getcart (Logged-in User)
  const { data: serverCart = [], isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await API.get('/cart/getcart');
      return data.cart;
    },
    enabled: !!user,
  });

  // 2. Get Billing Summary -> GET /api/cart/billing (Logged-in User)
  const { data: serverBilling = { itemsPrice: 0, shippingPrice: 0, totalPrice: 0 }, isLoading: isBillingLoading } = useQuery({
    queryKey: ['cartBilling'],
    queryFn: async () => {
      const { data } = await API.get('/cart/billing');
      return data.billing;
    },
    enabled: !!user && !isCartLoading,
  });

  // ── Calculate Guest Billing Summary ──
  const guestBilling = React.useMemo(() => {
    const itemsPrice = guestCartItems.reduce((acc, item) => {
      const isCustom = item.type === 'custom';
      const prod = isCustom ? item.customCandle : item.product;
      const price = isCustom
        ? prod?.totalPrice || 0
        : prod?.discountPrice || prod?.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);

    return {
      itemsPrice,
      shippingPrice: itemsPrice > 0 ? 0 : 0,
      totalPrice: itemsPrice,
    };
  }, [guestCartItems]);

  // ── Server Mutations (Logged-in User) ──
  const addToCartMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await API.post('/cart/addtocart', payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
      window.dispatchEvent(new Event('open-cart'));
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add to cart"),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const { data } = await API.patch(`/cart/${itemId}`, { quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
    },
    onError: () => toast.error("Could not update quantity"),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId) => {
      const { data } = await API.delete(`/cart/${itemId}`);
      return data;
    },
    onSuccess: () => {
      toast.error("Item removed");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await API.delete('/cart/clear');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
    },
  });

  // Consolidated Return Object
  const cart = user ? serverCart : guestCartItems;
  const billing = user ? serverBilling : guestBilling;
  const isLoading = user ? (isCartLoading || isBillingLoading) : false;

  return {
    cart,
    billing,
    isLoading,
    addToCart: (item, quantity = 1) => {
      if (!user) {
        const guestItem = item.customCandleId
          ? { customCandleId: item.customCandleId, quantity, customCandle: item.customCandle || item, type: 'custom' }
          : { productId: item._id || item, quantity, product: item.product || item, type: 'simpleCandle' };

        addToGuestCart(guestItem);

        toast((t) => (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-sm">Item saved to cart!</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/signin?redirect=/cart");
                }}
                className="px-3 py-1.5 bg-coffee-600 text-white text-xs rounded font-semibold cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1.5 border border-coffee-200 text-coffee-600 text-xs rounded cursor-pointer"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        ), { duration: 4000 });

        return;
      }

      if (item.customCandleId) {
        return addToCartMutation.mutate({ customCandleId: item.customCandleId, quantity });
      }

      if (item._id) {
        return addToCartMutation.mutate({ productId: item._id, quantity });
      }

      if (typeof item === 'string') {
        return addToCartMutation.mutate({ productId: item, quantity });
      }
    },
    removeFromCart: (itemId) => {
      if (!user) {
        removeGuestCartItem(itemId);
        toast.error("Item removed");
        return;
      }
      removeFromCartMutation.mutate(itemId);
    },
    updateQuantity: (itemId, quantity) => {
      if (!user) {
        updateGuestCartQuantity(itemId, quantity);
        return;
      }
      updateQuantityMutation.mutate({ itemId, quantity });
    },
    clearCart: () => {
      if (!user) {
        clearGuestCart();
        return;
      }
      clearCartMutation.mutate();
    },
    isAdding: addToCartMutation.isPending,
  };
};