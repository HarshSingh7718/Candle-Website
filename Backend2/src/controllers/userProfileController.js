import { CustomError } from "../middleware/errorHandler.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -token") //  hide sensitive data
  .populate("wishlist", "name price images").populate("cart.product", "name price images");
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json({
    success: true,
    user
  });
};
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  const {
    firstName,
    lastName,
    email,
    phoneNumber
  } = req.body;

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

  //Phone Update
  if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new CustomError("Invalid phone number format", 400);
    }

    // Check if another user already has this phone number
    const existingPhoneUser = await User.findOne({
      phoneNumber,
      _id: {
        $ne: req.user._id
      }
    });
    if (existingPhoneUser) {
      throw new CustomError("Phone number already in use", 400);
    }

    // Update the number and flag it as unverified!
    user.phoneNumber = phoneNumber;
    user.isPhoneVerified = false;
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