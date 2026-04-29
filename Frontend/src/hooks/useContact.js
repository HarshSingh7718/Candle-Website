import { useMutation } from "@tanstack/react-query";
import API from "../api";

export const useSubmitContact = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await API.post("/contact", formData);
      return data;
    }
  });
};