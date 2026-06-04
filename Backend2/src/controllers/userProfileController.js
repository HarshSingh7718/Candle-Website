import { CustomError } from "../middleware/errorHandler.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendOtp, verifyOtpService } from "../services/otp_services.js";

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -token")
  .populate("wishlist", "name price images").populate("cart.product", "name price images");
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json({
    success: true,
    user
  });
};

/**
 * updateUserProfile — Standard profile update for name & email ONLY.
 *
 * SECURITY: phoneNumber is explicitly stripped from this endpoint.
 * Phone updates MUST go through the OTP-verified PUT /user/profile/phone route.
 * This prevents a malicious user from bypassing the OTP flow via Postman.
 */
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  const {
    firstName,
    lastName,
    email,
  } = req.body;

  // =========================
  // REJECT PHONE NUMBER UPDATES
  // =========================
  if (req.body.phoneNumber !== undefined) {
    throw new CustomError(
      "Phone number cannot be updated through this endpoint. Use the OTP verification flow.",
      400
    );
  }

  // =========================
  // EMAIL UPDATE
  // =========================
  if (email !== undefined) {
    const existingUser = await User.findOne({
      email,
      _id: {
        $ne: req.user._id
      }
    });
    if (existingUser) {
      throw new CustomError("Email already in use", 400);
    }
    if (!email.includes("@")) {
      throw new CustomError("Invalid email", 400);
    }
    user.email = email;
  }

  // =========================
  // BASIC INFO UPDATE
  // =========================
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isPhoneVerified: user.isPhoneVerified
    }
  });
};

/**
 * requestPhoneOtp — Sends a 6-digit OTP to the NEW phone number.
 *
 * Validates the number format, checks it isn't taken by another user,
 * then dispatches the OTP via MSG91. MSG91 manages OTP storage/expiry internally.
 */
export const requestPhoneOtp = async (req, res) => {
  const { newPhoneNumber } = req.body;

  if (!newPhoneNumber) {
    throw new CustomError("New phone number is required", 400);
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(newPhoneNumber)) {
    throw new CustomError("Enter a valid 10-digit Indian phone number", 400);
  }

  // Prevent updating to the same number
  if (newPhoneNumber === req.user.phoneNumber) {
    throw new CustomError("New phone number must be different from current number", 400);
  }

  // Check if another user already owns this phone number
  const existingPhoneUser = await User.findOne({
    phoneNumber: newPhoneNumber,
    _id: { $ne: req.user._id }
  });
  if (existingPhoneUser) {
    throw new CustomError("This phone number is already in use", 400);
  }

  // Send OTP via MSG91 (handles generation, delivery, and expiry internally)
  await sendOtp(newPhoneNumber);

  res.status(200).json({
    success: true,
    message: "OTP sent to your new phone number"
  });
};

/**
 * verifyAndUpdatePhone — Verifies the OTP and updates the user's phone number.
 *
 * Accepts { newPhoneNumber, otp }. Calls MSG91 verify, and on success,
 * updates the user document with the new number and marks it as verified.
 */
export const verifyAndUpdatePhone = async (req, res) => {
  const { newPhoneNumber, otp } = req.body;

  if (!newPhoneNumber || !otp) {
    throw new CustomError("Phone number and OTP are required", 400);
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(newPhoneNumber)) {
    throw new CustomError("Enter a valid 10-digit Indian phone number", 400);
  }

  // Double-check no one else took this number between OTP send and verify
  const existingPhoneUser = await User.findOne({
    phoneNumber: newPhoneNumber,
    _id: { $ne: req.user._id }
  });
  if (existingPhoneUser) {
    throw new CustomError("This phone number is already in use", 400);
  }

  // Verify OTP via MSG91
  const result = await verifyOtpService(newPhoneNumber, otp);
  if (result.status !== "approved") {
    throw new CustomError(
      result.status === "pending"
        ? "OTP invalid or expired. Please request a new one."
        : "OTP verification failed",
      400
    );
  }

  // OTP verified — update phone number
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  user.phoneNumber = newPhoneNumber;
  user.isPhoneVerified = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Phone number updated successfully",
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isPhoneVerified: user.isPhoneVerified
    }
  });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError("Please provide both old and new passwords", 400);
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new CustomError("Invalid old password", 400);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
};