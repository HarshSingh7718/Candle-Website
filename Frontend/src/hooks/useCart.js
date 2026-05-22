import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';
import { useUser } from './useAuth';

export const useCart = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  // 1. Get Full Cart -> GET /api/cart/getcart
  const { data: cart = [], isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await API.get('/cart/getcart');
      return data.cart;
    },
    enabled: !!user
  });

  // 👉 NEW: Get Billing Summary -> GET /api/cart/billing
  const { data: billing = { itemsPrice: 0, shippingPrice: 0, totalPrice: 0 }, isLoading: isBillingLoading } = useQuery({
    queryKey: ['cartBilling'],
    queryFn: async () => {
      const { data } = await API.get('/cart/billing');
      return data.billing;
    },
    // Only fetch billing if the user exists and the cart query has finished loading
    enabled: !!user && !isCartLoading
  });

  // 2. Add Item -> POST /api/cart/addtocart
  const addToCartMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await API.post('/cart/addtocart', payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Added to cart");
      // 👉 Invalidate both queries to sync UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add to cart")
  });

  // 3. Update Quantity -> PATCH /api/cart/:itemId
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const { data } = await API.patch(`/cart/${itemId}`, { quantity });
      return data;
    },
    onSuccess: () => {
      // 👉 Invalidate both queries to sync UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
    },
    onError: () => toast.error("Could not update quantity")
  });

  // 4. Remove Item -> DELETE /api/cart/:itemId
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId) => {
      const { data } = await API.delete(`/cart/${itemId}`);
      return data;
    },
    onSuccess: () => {
      toast.error("Item removed");
      // 👉 Invalidate both queries to sync UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
    }
  });

  // 5. Clear Cart -> DELETE /api/cart/clear
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await API.delete('/cart/clear');
      return data;
    },
    onSuccess: () => {
      // 👉 Invalidate both queries to sync UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartBilling'] });
    }
  });

  return {
    cart,
    billing, // 👉 Expose billing data to your components
    isLoading: isCartLoading || isBillingLoading, // Consolidate loading states
    addToCart: (item, quantity = 1) => {

      // Scenario 1: It's a Custom Candle object from Customized.jsx
      if (item.customCandleId) {
        return addToCartMutation.mutate({ customCandleId: item.customCandleId, quantity });
      }

      // Scenario 2: It's a standard Product object from your store pages
      if (item._id) {
        return addToCartMutation.mutate({ productId: item._id, quantity });
      }

      // Scenario 3: Safety fallback just in case you pass a raw string ID directly
      if (typeof item === 'string') {
        return addToCartMutation.mutate({ productId: item, quantity });
      }

      // Catch-all error if something weird gets passed
      console.error("Invalid item passed to cart:", item);
    },
    removeFromCart: (itemId) => removeFromCartMutation.mutate(itemId),
    updateQuantity: (itemId, quantity) => updateQuantityMutation.mutate({ itemId, quantity }),
    clearCart: () => clearCartMutation.mutate(),
    isAdding: addToCartMutation.isPending
  };
};