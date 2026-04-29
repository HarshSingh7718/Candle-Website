import { useQuery } from "@tanstack/react-query";
import API from "../api";

export const useGlobalSearch = (keyword) => {
  return useQuery({
    queryKey: ["global-search", keyword],
    queryFn: async () => {
      if (!keyword || keyword.length < 2) return [];
      const { data } = await API.get(`/search?keyword=${keyword}&limit=6`);
      return data.products;
    },
    enabled: keyword.length >= 2, // Start searching after 2 characters
    staleTime: 300000, // Cache results for 5 minutes
  });
};