import { z } from "zod";

export const sendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number")
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    otp: z.string().min(4, "OTP is required")
  })
});

export const completeProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, "Identifier is required"),
    password: z.string().min(1, "Password is required")
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })
});
