import { useQuery } from "@tanstack/react-query";
import API from "../api";

export const useHomeData = () => {
  return useQuery({
    queryKey: ["homeData"],
    queryFn: async () => {
      const { data } = await API.get("/home");
      return data;
    },
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
  });
};