import { useQuery } from "@tanstack/react-query";
import API from "../api";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await API.get("/candles"); // Assuming your route is /api/products
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
