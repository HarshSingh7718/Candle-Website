import { useQuery, useMutation } from "@tanstack/react-query";
import { createCustomCandle } from '../api';
import API from "../api"; 
import toast from 'react-hot-toast';

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await API.get("/candles");
      return data.candles;
    },
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
  });
};

export const useProductsByCategory = (categoryId) => {
  return useQuery({
    queryKey: ["products", categoryId],
    queryFn: async () => {
      // API call: GET /api/products/category/69f1...
      const { data } = await API.get(`/products/category/${categoryId}`);
      return data.products;
    },
    enabled: !!categoryId, // Only run if we have an ID
  });
};

// Fetch a single product by ID
export const useSingleProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await API.get(`/product/${id}`); // Adjust route to your backend
      return { product: data.product, similarProducts: data.similarProducts };
    },
    enabled: !!id,
  });
};


export const useCustomCandleBuilder = () => {
  return useMutation({
    mutationFn: createCustomCandle,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create your custom candle.");
    }
  });
};