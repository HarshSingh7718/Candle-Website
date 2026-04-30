import { useQuery } from "@tanstack/react-query";
import API from "../api";

export const useGlobalSearch = (keyword) => {
  return useQuery({
    queryKey: ["global-search", keyword],
    queryFn: async () => {
      // Logic check: if keyword is too short, return empty immediately
      if (!keyword || keyword.trim().length < 2) return [];

      const { data } = await API.get(`/search?keyword=${keyword}&limit=8`);
      return data.products || [];
    },
    // Only fetch if keyword is 2+ chars
    enabled: !!keyword && keyword.trim().length >= 2,
    staleTime: 300000,
  });
};