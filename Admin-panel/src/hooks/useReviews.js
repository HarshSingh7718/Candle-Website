import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useGetReviews = (page = 1, limit = 10, rating, status) => {
    return useQuery({
        queryKey: ['reviews', page, limit, rating, status],
        queryFn: async () => {
            let url = `/admin/reviews?page=${page}&limit=${limit}`;
            if (rating) url += `&rating=${rating}`;
            if (status) url += `&status=${status}`;

            const { data } = await api.get(url);
            return data; // Returning the whole object to get totalCount and avgRating
        }
    });
};

export const useUpdateReviewStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Destructure the payload so we can pass multiple arguments
        mutationFn: async ({ productId, reviewId, status }) => {
            const { data } = await api.patch(`/admin/review/${productId}/${reviewId}`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reviews']);
            toast.success("Review status updated!");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update review status")
    });
};