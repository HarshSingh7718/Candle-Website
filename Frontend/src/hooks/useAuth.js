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

export const useRegister = () => {
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const { otp, phoneNumber, firstName, lastName, email, password, confirmPassword } = payload;

      // STEP 1: Verify the OTP first to get the authorization token
      const verifyResponse = await API.post('/auth/user/verify-otp', {
        phoneNumber,
        otp
      });
      const tempToken = verifyResponse.data.tempToken;
      // STEP 2: Hit complete-profile, securely passing the token in the Header
      const profileResponse = await API.post('/auth/user/complete-profile', { phoneNumber, firstName, lastName, email, password, confirmPassword }, {
        headers: { Authorization: `Bearer ${tempToken}` }
      });

      // Optional: If your backend returns a NEW permanent token here that you need 
      // for future requests, you should save it to localStorage/cookies right here!
      // Example: localStorage.setItem('token', profileResponse.data.token);

      return profileResponse.data;
    },
    onSuccess: (data) => {
      // Log them in instantly!
      queryClient.setQueryData(['user'], data.user);

      // Clear out any old cart/wishlist/orders state just to be safe
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Note: We don't need a toast here if you prefer a silent redirect, 
      // but it's nice for UX!
      toast.success("Account created successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Verification failed. Please try again.");
    }
  });

  // 2. Explicitly return the mapped functions so VerifyOTP.jsx can read them!
  return {
    registerUser: registerMutation.mutateAsync,
    isPending: registerMutation.isPending
  };
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

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idToken) => {
      const { data } = await API.post('/auth/user/google-auth', { token: idToken });
      return data;
    },
    onSuccess: (data) => {
      // Only set the user cache if they are fully authenticated 
      if (!data.needsPhone) {
        queryClient.setQueryData(['user'], data.user);

        // Clear out old states
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    }
  });
};

export const useSendGooglePhoneOtp = () => {
  return useMutation({
    mutationFn: async (phoneNumber) => {
      const { data } = await API.post('/auth/user/send-phone-otp', { phoneNumber });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  });
};

export const useVerifyGooglePhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      // payload expects { phoneNumber, otp }
      const { data } = await API.patch('/auth/user/verify-phone', payload);
      return data;
    },
    onSuccess: (data) => {
      // Update the user cache with their newly verified phone number
      // NOTE: Make sure your backend sends the updated user object back!
      if (data.user) {
        queryClient.setQueryData(['user'], data.user);
      } else {
        // Fallback just in case your backend doesn't send the user back
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }

      toast.success("Profile complete! Welcome to Naisha Creations.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Verification failed. Please try again.");
    }
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

  const sendRegistrationOtpMutation = useMutation({
    mutationFn: async (phoneNumber) => {
      const { data } = await API.post('/auth/user/send-otp', { phoneNumber });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent to your mobile");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  });

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
    mutationFn: async ({ phoneNumber, newPassword, confirmPassword }) => {
      const { data } = await API.post('/auth/user/forgot-password/reset-password', { phoneNumber, newPassword, confirmPassword });
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
    sendRegistrationOtp: sendRegistrationOtpMutation.mutateAsync,
    isSendingRegOtp: sendRegistrationOtpMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingOtp: forgotPasswordMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifying: verifyOtpMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      // Send the updated first name, last name, etc. to the backend
      const { data } = await API.put('/user/profile', userData);
      return data;
    },
    onSuccess: (data) => {
      // Instantly update the UI with the fresh data from the server
      queryClient.setQueryData(['user'], data.user);
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  });
};