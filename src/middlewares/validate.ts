import { Request, Response, NextFunction } from "express";
import { ZodSchema, z } from "zod";

const formatValidationErrors = (errors: any) => {
  return Object.keys(errors).reduce((acc: any, key) => {
    if (errors[key]?._errors) {
      acc[key] = errors[key]._errors;
    }
    return acc;
  }, {});
};

export const validate = (
  schemas: { body?: ZodSchema<any>; params?: ZodSchema<any> } // Allow separate schemas for body and params
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any = {};

    // Validate body if schema exists
    if (schemas.body) {
      const bodyResult = schemas.body.safeParse(req.body);
      if (!bodyResult.success) {
        errors.body = formatValidationErrors(bodyResult.error.format());
      }
    }

    // Validate params if schema exists
    if (schemas.params) {
      const paramsResult = schemas.params.safeParse(req.params);
      if (!paramsResult.success) {
        errors.params = formatValidationErrors(paramsResult.error.format());
      }
    }

    // If there are errors, return response
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors, "body: ", req.body);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }
  
    next();
  };
};
