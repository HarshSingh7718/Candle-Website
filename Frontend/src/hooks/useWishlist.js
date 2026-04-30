import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';
import { useUser } from './useAuth'; // To check if user is logged in

export const useWishlist = (productId = null) => {
    const queryClient = useQueryClient();
    const { data: user } = useUser();

    // 1. Fetch entire wishlist (for the Wishlist page)
    const { data: wishlist = [], isLoading } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const { data } = await API.get("/wishlist");
            return data.wishlist;
        },
        staleTime: 1000 * 60 * 5, // Fresh for 5 mins
        enabled: !!user, // Only fetch if user is logged in
    });

    // 2. Derive "liked" state for a specific product
    // We check the wishlist cache first, then fall back to the user object
    const liked = wishlist.some(item => (item._id || item) === productId) || 
                  user?.wishlist?.some(item => (item._id || item) === productId);

    // 3. Toggle Mutation (Add or Remove based on "liked" state)
    const toggleWishlistMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("Please login first");

            if (liked) {
                // Remove logic
                return await API.delete("/wishlist", { data: { productId } });
            } else {
                // Add logic
                return await API.post("/wishlist", { productId });
            }
        },
        onSuccess: () => {
            // Refresh everything to keep UI in sync
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            
            toast.success(liked ? "Removed from wishlist" : "Added to wishlist");
        },
        onError: (err) => {
            toast.error(err.message === "Please login first" ? err.message : "Action failed");
        }
    });

    // 4. Direct Remove Mutation (Specifically for the "X" button on Wishlist page)
    const removeMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await API.delete("/wishlist", { data: { productId: id } });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.error("Removed from wishlist");
        }
    });

    return { 
        wishlist, 
        isLoading, 
        liked,
        isUpdating: toggleWishlistMutation.isPending || removeMutation.isPending,
        toggleWishlist: () => toggleWishlistMutation.mutate(),
        removeItem: (id) => removeMutation.mutate(id) 
    };
};