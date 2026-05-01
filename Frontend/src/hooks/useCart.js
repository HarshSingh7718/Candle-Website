import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';
import { useUser } from './useAuth';

export const useCart = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();



  // 1. Get Full Cart -> GET /api/cart/getcart
  const { data: cart = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await API.get('/cart/getcart');
      return data.cart; // Assumes backend returns { cart: [...] }
    },
    enabled: !!user
  });



  // 2. Add Item -> POST /api/cart/addtocart
  const addToCartMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await API.post('/cart/addtocart', payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => toast.error("Could not update quantity")
  });



  // 4. Remove Item -> DELETE /api/cart/:itemId
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId) => {
      const { data } = await API.delete(`/cart/${itemId}`);
      return data;
    },
    onSuccess: () => {
      toast.error("Item removed");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });



  // 5. Clear Cart -> DELETE /api/cart/clear
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await API.delete('/cart/clear');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });


  
  return { 
    cart, 
    isLoading, 
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
    // Use item._id from the cart array for these:
    removeFromCart: (itemId) => removeFromCartMutation.mutate(itemId),
    updateQuantity: (itemId, quantity) => updateQuantityMutation.mutate({ itemId, quantity }),
    clearCart: () => clearCartMutation.mutate(),
    isAdding: addToCartMutation.isPending
  };
};