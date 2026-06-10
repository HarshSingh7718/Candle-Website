import { useQuery, useMutation, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { createCustomCandle } from '../api';
import API from "../api"; 
import toast from 'react-hot-toast';

export const useProducts = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", params],
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams();
      searchParams.append("page", pageParam);
      if (params.search) searchParams.append("search", params.search);
      if (params.maxPrice) searchParams.append("maxPrice", params.maxPrice);
      if (params.sort) searchParams.append("sort", params.sort);
      if (params.filter) searchParams.append("filter", params.filter);
      searchParams.append("limit", "12");

      const { data } = await API.get(`/candles?${searchParams.toString()}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useProductsByCategory = (categorySlug, params = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", categorySlug, params],
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams();
      searchParams.append("page", pageParam);
      if (params.search) searchParams.append("search", params.search);
      if (params.maxPrice) searchParams.append("maxPrice", params.maxPrice);
      if (params.sort) searchParams.append("sort", params.sort);
      searchParams.append("limit", "12");

      const { data } = await API.get(`/products/category/${categorySlug}?${searchParams.toString()}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!categorySlug,
  });
};

// Fetch a single product by slug
export const useSingleProduct = (slug) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await API.get(`/product/${slug}`); // Adjust route to your backend
      return { product: data.product, similarProducts: data.similarProducts, reviews: data.reviews };
    },
    enabled: !!slug,
  });
};

// 1. Hook to fetch options for Steps 1 (Vessel), 2 (Scent), and 3 (Add-ons)
export const useCustomizationOptions = (step) => {
  return useQuery({
    queryKey: ['customizationOptions', step],
    queryFn: async () => {
      // Step 4 is just a custom message string now, so we don't need to hit the DB!
      if (step === 4) return [];

      const { data } = await API.get(`/customization-options/${step}`);
      return data;
    },
    // Only trigger the API call if we are on steps 1, 2, or 3
    enabled: step >= 1 && step <= 3,

    // Cache the options for 30 minutes. This makes navigating "Back" and "Next" instant!
    staleTime: 1000 * 60 * 30,
  });
};

// 2. Hook to create the final Custom Candle
export const useCreateCustomCandle = () => {
  return useMutation({
    mutationFn: async (payload) => {
      /* 
         The payload perfectly matches your createCustomCandle controller:
         {
             vesselId: "...",
             scentId: "...",
             addOnIds: ["...", "..."],
             message: "HAPPY BIRTHDAY",
             quantity: 1
         }
      */
      // Double check this URL matches exactly where your customRoute.js is mounted!
      const { data } = await API.post('/custom-candle', payload);
      return data;
    }
  });
};