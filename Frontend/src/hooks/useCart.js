import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';

export const useCart = () => {
  const queryClient = useQueryClient();

  // 1. Get Full Cart -> GET /api/cart/getcart
  const { data: cart = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await API.get('/cart/getcart');
      return data.cart; // Assumes backend returns { cart: [...] }
    },
  });

  // 2. Add Item -> POST /api/cart/addtocart
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      const { data } = await API.post('/cart/addtocart', { productId, quantity });
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
    addToCart: (product, quantity) => addToCartMutation.mutate({ productId: product._id, quantity }),
    // Use item._id from the cart array for these:
    removeFromCart: (itemId) => removeFromCartMutation.mutate(itemId),
    updateQuantity: (itemId, quantity) => updateQuantityMutation.mutate({ itemId, quantity }),
    clearCart: () => clearCartMutation.mutate(),
    isAdding: addToCartMutation.isPending
  };
};