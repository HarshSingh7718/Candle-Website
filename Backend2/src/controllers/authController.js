import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { config } from "../config/index.js";
import { generateToken, setTokenCookie, clearTokenCookie, setAdminTokenCookie, clearAdminTokenCookie} from "../utils/token.js";
import { verifyGoogleToken, findOrCreateGoogleUser } from "../services/googleAuthService.js";
import { sendOtp, verifyOtpService } from "../services/otp_services.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from '../utils/sendEmail.js';
import { checkOtpRateLimit } from "../utils/otpRateLimiter.js";





// export const register = async (req, res) => {
import { CustomError } from "../middleware/errorHandler.js"; // export const register = async (req, res) => {
//     try {
//         const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

//         if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }
//         if (email && !email.includes("@")) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid email"
//             });
//         }
//         const phoneRegex = /^[6-9]\d{9}$/;
//         if (!phoneRegex.test(phoneNumber)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid phone number"
//             });
//         }

//         const existingUser = await User.findOne({
//             $or: [{ email }, { phoneNumber }]
//         });

//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User already exists"
//             });
//         }
//         if (password !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password and confirm password do not match"
//             });
//         }

//         await sendOtp(phoneNumber);

//         return res.status(200).json({
//             success: true,
//             message: "OTP sent to phone number"
//         });

//     } catch (error) {

//         return res.status(500).json({

//             success: false,
//             message: error.message
//         });
//     }
// };

// export const verifyOtpAndRegister = async (req, res) => {
//     try {
//         const { firstName, lastName, email, phoneNumber, password, confirmPassword, otp } = req.body;
//         if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }
//         if (password !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password and confirm password do not match"
//             });
//         }

//         if (!otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "OTP is required"
//             });
//         }

//         const result = await verifyOtpService(phoneNumber, otp);

//         if (result.status !== "approved") {
//             return res.status(400).json({
//                 success: false,
//                 message: result.status === "pending"
//                     ? "OTP expired or invalid"
//                     : "OTP verification failed"
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = await User.create({
//             firstName,
//             lastName,
//             email: email.toLowerCase(),
//             phoneNumber,
//             password: hashedPassword,
//             isPhoneVerified: true,
//             isLoggedIn: true
//         });

//         const token = generateToken(newUser);
//         setTokenCookie(res, token);

//         return res.status(201).json({
//             success: true,
//             message: "User registered successfully",
//             // user: newUser
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

export const sendOtpController = async (req, res, next) => {
  const {
    phoneNumber
  } = req.body;
  const existingUser = await User.findOne({
    phoneNumber
  });
  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }
  
  checkOtpRateLimit(phoneNumber);
  
  await sendOtp(phoneNumber);
  res.status(200).json({
    success: true,
    message: "OTP sent"
  });
};
export const verifyOtpController = async (req, res, next) => {
  const {
    phoneNumber,
    otp
  } = req.body;
  const result = await verifyOtpService(phoneNumber, otp);
  if (result.status !== "approved") {
    throw new CustomError("Invalid or expired OTP", 400);
  }

  //  Create TEMP token (only phone verified)
  const tempToken = jwt.sign({
    phoneNumber,
    isOtpVerified: true
  }, config.jwt.secret, {
    expiresIn: "10m"
  } // short expiry
  );
  res.status(200).json({
    success: true,
    message: "OTP verified",
    tempToken
  });
};
export const completeProfile = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword
  } = req.body;

  //  Get phone from token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new CustomError("Unauthorized", 401);
  }
  const decoded = jwt.verify(token, config.jwt.secret);
  if (!decoded.isOtpVerified) {
    throw new CustomError("OTP not verified", 401);
  }
  const phoneNumber = decoded.phoneNumber;

  //  Validate fields
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    throw new CustomError("All fields are required", 400);
  }
  if (!email.includes("@")) {
    throw new CustomError("Invalid email", 400);
  }
  if (password !== confirmPassword) {
    throw new CustomError("Passwords do not match", 400);
  }

  //  Check existing user again
  const existingUser = await User.findOne({
    $or: [{
      email
    }, {
      phoneNumber
    }]
  });
  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phoneNumber,
    password: hashedPassword,
    isPhoneVerified: true
  });

  sendWelcomeEmail(newUser.email, newUser.firstName);

  //  Final login token
  const authToken = generateToken(newUser);
  setTokenCookie(res, authToken);
  res.status(201).json({
    success: true,
    message: "Registration completed",
    user: {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber
    }
  });
};
export const googleAuth = async (req, res) => {
  const {
    token
  } = req.body;
  if (!token) {
    throw new CustomError("Token is required", 400);
  }
  const payload = await verifyGoogleToken(token);
  const { user, isNewUser } = await findOrCreateGoogleUser(payload);
  if (user && !user.isActive) {
      return res.status(403).json({
          success: false,
          message: "Access revoked by admin"
      });
  }
  if (isNewUser) {
    sendWelcomeEmail(user.email, user.firstName);
  }
  const jwt_token = generateToken(user);
  setTokenCookie(res, jwt_token);
  return res.status(200).json({
    success: true,
    message: "Google login successful",
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    },
    needsPhone: user.needsPhone
  });
};
export const saveGooglePhone = async (req, res) => {
  const {
    phoneNumber,
    otp
  } = req.body;
  const user_Id = req.user;
  if (!phoneNumber || !otp) {
    throw new CustomError("Phone number, and OTP are required", 400);
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new CustomError("Invalid phone number", 400);
  }
  const verification = await verifyOtpService(phoneNumber, otp);
  if (verification.status !== "approved") {
    throw new CustomError(verification.status === "pending" ? "OTP invalid or expired" : "OTP verification failed", 400);
  }
  const user = await User.findById(user_Id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  user.phoneNumber = phoneNumber;
  user.isPhoneVerified = true;
  user.isLoggedIn = true;
  user.needsPhone = false;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Phone number verified and saved successfully"
    // user
  });
};
export const login = async (req, res) => {
  let {
    identifier,
    password
  } = req.body;
  if (!identifier || !password) {
    throw new CustomError("All fields are required", 400);
  }
  identifier = identifier.trim().replace(/\s+/g, "");
  const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
  const query = isEmail ? {
    email: identifier.toLowerCase()
  } : {
    phoneNumber: identifier
  };
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!isEmail && !phoneRegex.test(identifier)) {
    throw new CustomError("Invalid phone number", 400);
  }
  const existingUser = await User.findOne(query);
  
  if (!existingUser) {
    throw new CustomError("User not exists", 400);
  }
  if (!existingUser.isActive) {
      return res.status(403).json({
          success: false,
          message: "Access revoked by admin"
      });
  }
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    throw new CustomError("Password is invalid", 400);
  }
  const token = generateToken(existingUser);
  setTokenCookie(res, token);
  existingUser.isLoggedIn = true;
  // existingUser.isAdmin =  existingUser.role === "admin";
  await existingUser.save();
  return res.status(200).json({
    success: true,
    message: `Welcome back ${existingUser.firstName}`,
    user: {
      _id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber
    },
    role: existingUser.role
  });
};
export const adminLogin = async (req, res) => {
  let {
    identifier,
    password
  } = req.body;
  if (!identifier || !password) {
    throw new CustomError("All fields are required", 400);
  }
  identifier = identifier.trim().replace(/\s+/g, "");
  const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
  const query = isEmail ? {
    email: identifier.toLowerCase()
  } : {
    phoneNumber: identifier
  };
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!isEmail && !phoneRegex.test(identifier)) {
    throw new CustomError("Invalid phone number", 400);
  }
  const existingUser = await User.findOne(query);
  if (!existingUser) {
    throw new CustomError("User not exists", 400);
  }
  if (!existingUser.isActive) {
      return res.status(403).json({
          success: false,
          message: "Access revoked by admin"
      });
  }
  if (existingUser.role !== "admin") {
    throw new CustomError("Access denied: Admin only", 403);
  }
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    throw new CustomError("Password is invalid", 400);
  }
  const token = generateToken(existingUser);
  setAdminTokenCookie(res, token);
  existingUser.isLoggedIn = true;
  // existingUser.isAdmin =  existingUser.role === "admin";
  await existingUser.save();
  return res.status(200).json({
    success: true,
    message: `Welcome back ${existingUser.firstName}`,
    user: {
      _id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber
    },
    role: existingUser.role
  });
};

// export const revokeUserAccess = async (req, res) => {
//     try {
//         const { userId } = req.params; // user to revoke
//         const admin = req.user; // from verifyToken middleware

//         // Only admins can revoke
//         if (admin.role !== "admin") {
//             return res.status(403).json({
//                 success: false,
//                 message: "Access denied: Admin only"
//             });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         user.isActive = false;
//         user.isLoggedIn = false; // immediately log out user
//         await user.save();

//         return res.status(200).json({
//             success: true,
//             message: `Access revoked for ${user.firstName}`
//         });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };

export const logout = async (req, res) => {
  const userId = req.id;
  await User.findByIdAndUpdate(userId, {
    isLoggedIn: false
  });
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: " User logged out successfully"
  });
};

export const adminLogout = async (req, res) => {
  const userId = req.id;
  await User.findByIdAndUpdate(userId, { isLoggedIn: false });
  clearAdminTokenCookie(res);
  return res.status(200).json({ success: true, message: "Admin logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const {
    phoneNumber
  } = req.body;
  const user = await User.findOne({
    phoneNumber
  });
  if (!user) {
    throw new CustomError("User not found", 400);
  }
  
  checkOtpRateLimit(phoneNumber);
  
  await sendOtp(phoneNumber);
  user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  return res.status(200).json({
    success: true,
    message: "OTP sent successfully"
  });
};
export const verifyOTP = async (req, res) => {
  const {
    phoneNumber,
    otp
  } = req.body;
  if (!otp) {
    throw new CustomError("Please eneter OTP", 400);
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new CustomError("Invalid phone number", 400);
  }
  const user = await User.findOne({
    phoneNumber
  });
  if (!user) {
    throw new CustomError("User not found", 400);
  }
  if (user.otpExpiresAt < new Date()) {
    throw new CustomError("OTP expired. Please request a new one", 400);
  }
  const result = await verifyOtpService(phoneNumber, otp);
  if (result.status !== "approved") {
    throw new CustomError("Invalid OTP", 400);
  }
  user.otpExpiresAt = null;
  user.isOtpVerified = true;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "OTP verified successfully"
  });
};
export const resendOtp = async (req, res) => {
  const {
    phoneNumber
  } = req.body;
  if (!phoneNumber) {
    throw new CustomError("Please Enter phone number", 400);
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new CustomError("Invalid phone number", 400);
  }
  const user = await User.findOne({
    phoneNumber
  });
  if (!user) {
    throw new CustomError("User not found", 400);
  }
  
  checkOtpRateLimit(phoneNumber);
  
  await sendOtp(phoneNumber);
  user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  return res.status(200).json({
    success: true,
    message: "OTP resent successfully"
  });
};
export const resetPassword = async (req, res) => {
  const {
    phoneNumber,
    newPassword,
    confirmPassword
  } = req.body;
  if (!phoneNumber || !newPassword || !confirmPassword) {
    throw new CustomError("All feilds are required", 400);
  }
  if (newPassword !== confirmPassword) {
    throw new CustomError("Password and confirm password do not match", 400);
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new CustomError("Invalid phone number", 400);
  }
  const user = await User.findOne({
    phoneNumber
  });
  if (!user) {
    throw new CustomError("User not found", 400);
  }
  if (!user.isOtpVerified) {
    throw new CustomError("OTP verification required", 401);
  }
  if (newPassword.length < 6) {
    throw new CustomError("Password must be at least 6 characters", 400);
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.isOtpVerified = false;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Password reset successfully"
  });
};