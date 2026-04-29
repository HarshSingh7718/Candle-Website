import { useQuery } from '@tanstack/react-query';
import API from '../api';

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await API.get('/user/profile');
      return data.user;
    },
    retry: false, // If 401, don't keep trying
    staleTime: 1000 * 60 * 5, // Keep user data fresh for 5 mins
  });
};