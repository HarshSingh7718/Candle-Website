import crypto from "crypto";
import { logger, sendSlackAlert } from "../utils/logger.js";

export class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Capture stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, please login again";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired, please login again";
  }

  // Razorpay or third-party SDK errors that nest the message inside err.error
  if (err.error && err.error.description) {
    statusCode = err.statusCode || 400;
    message = err.error.description;
  }

  const correlationId = crypto.randomUUID();

  // For 500 errors, mask the message to the user, but log the real error
  const userMessage = statusCode >= 500 ? "An unexpected error occurred. Please contact support." : message;

  // Detailed server-side logging
  logger.error(`[Error ID: ${correlationId}] ${statusCode} - ${message}`, { stack: err.stack });

  if (statusCode >= 500) {
      // Don't block the response waiting for the Slack alert
      sendSlackAlert(correlationId, statusCode, message, err.stack).catch(e => 
          logger.error("Slack alert failed", e)
      );
  }

  res.status(statusCode).json({
    success: false,
    message: userMessage,
    errorId: correlationId,
  });
};
