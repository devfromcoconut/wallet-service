import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError } from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error:", err.message);

  let status = 500;
  let message = "Internal Server Error";
  let errors: any = undefined;

  // 🔹 Handle Zod Validation Errors (for request body validation)
  if (err instanceof ZodError) {
    status = 400;
    message = "Validation Error";
    errors = err.flatten().fieldErrors;
  }

  // 🔹 Handle Mongoose Validation Errors
  else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Mongoose Validation Error";
    errors = Object.values(err.errors).map((e: any) => e.message);
  }

  // 🔹 Handle Duplicate Key Errors (MongoDB unique constraint)
  else if (err.code === 11000) {
    status = 400;
    const duplicatedField = Object.keys(err.keyValue)[0]; // Get the duplicated field
    if (duplicatedField === "email") {
      message = "Email already exists. Please use a different email.";
    } else if (duplicatedField === "phone") {
      message =
        "Phone number already exists. Please use a different phone number.";
    } else if (duplicatedField === "businessName") {
      message =
        "Business name already exists. Please use a different business name.";
    } else {
      message = `${duplicatedField} already exists. Please use a different ${duplicatedField}.`;
    }
  }

  // 🔹 Handle Invalid ObjectId Errors (Mongoose CastError)
  else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 🔹 Handle JWT Errors (Invalid or Expired Tokens)
  else if (err instanceof JsonWebTokenError) {
    status = 401;
    message = "Invalid or expired token";
  }

  // 🔹 Handle Axios Errors from ShippingService
  else if (axios.isAxiosError(err)) {
    status = err.response?.status || 500;
    message = err.response?.data?.message || "Shipping service error";
    errors = err.response?.data || undefined;
  }

  // 🔹 Handle Custom App Errors (e.g., manually thrown errors)
  else if (err.status) {
    status = err.status;
    message = err.message || "Error";
  }

  // 🔹 Handle any other errors that don't fall under the above cases
  else if (err.message) {
    message = err.message;
  }

  // Send the error response with the appropriate status, message, and success: false
  res.status(status).json({
    success: false,
    status,
    message,
    errors,
  });
};
