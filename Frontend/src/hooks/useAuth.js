import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import toast from 'react-hot-toast';

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await API.get('/user/profile');
      return data.user;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await API.post('/auth/user/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await API.post('/auth/user/logout');
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);

      queryClient.setQueryData(['cart'], []);
      queryClient.setQueryData(['wishlist'], []);

      // removeQueries is safer for orders so the page shows a loading state/empty state if navigated back to
      queryClient.removeQueries({ queryKey: ['orders'] });

    },
  });
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();

  // 1. Forgot Password - Sends OTP to Phone
  const forgotPasswordMutation = useMutation({
    mutationFn: async (phoneNumber) => {
      const { data } = await API.post('/auth/user/forgot-password', { phoneNumber });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send OTP. Is the number registered?");
    }
  });

  // 2. Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phoneNumber, otp }) => {
      const { data } = await API.post('/auth/user/verify-otp', { phoneNumber, otp });
      return data;
    },
    onSuccess: (data) => {
      toast.success("OTP Verified!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  });

  // 3. Reset Password
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ phoneNumber, otp, newPassword }) => {
      const { data } = await API.post('/auth/user/reset-password', { phoneNumber, otp, newPassword });
      return data;
    },
    onSuccess: (data) => {
      toast.success("Password reset successfully! You can now login.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    }
  });

  return {
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingOtp: forgotPasswordMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifying: verifyOtpMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
  };
};