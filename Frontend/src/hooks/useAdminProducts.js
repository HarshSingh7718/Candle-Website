import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: async (formData) => {
      // Axios automatically sets 'Content-Type: multipart/form-data' 
      // when it sees a FormData object
      const { data } = await API.post('/admin/product', formData);
      return data;
    },
    onSuccess: () => {
      toast.success("Product added successfully!");
      queryClient.invalidateQueries(['products']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add product");
    }
  });

  return { addProduct: addProductMutation.mutate, isAdding: addProductMutation.isPending };
};