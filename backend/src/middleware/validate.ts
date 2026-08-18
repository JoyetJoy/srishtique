import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const schemas = {
  signup: z.object({
    phone: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional(),
    name: z.string().min(1, 'Name is required').optional(),
  }),

  login: z.object({
    phone: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(1, 'Password is required'),
  }),

  verifySignup: z.object({
    phone: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(1, 'Name is required').optional(),
  }),

  forgotPassword: z.object({
    phone: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional(),
  }),

  resetPassword: z.object({
    phone: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),

  guestLogin: z.object({
    phone: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional(),
  }),

  checkoutRegister: z.object({
    phone: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
    name: z.string().optional(),
    addressId: z.number().optional(),
    addressObj: z.object({
      street: z.string(),
      country: z.string(),
      countryId: z.number(),
      state: z.string(),
      stateId: z.number(),
      city: z.string(),
      cityId: z.number().optional(),
      pincode: z.string()
    }).optional()
  }),

  wishlistToggle: z.object({
    productId: z.number().int().positive('Product ID must be a positive integer'),
  }),

  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    pincode: z.string().min(1, 'Pincode is required'),
  }),

  updateProfile: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    phone: z.string().optional(),
  }),

  setPassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),

  validateCoupon: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    cartTotal: z.number().min(0, 'Cart total must be a positive number'),
  }),
};

type SchemaKey = keyof typeof schemas;

export const validate = (schemaName: SchemaKey) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const schema = schemas[schemaName];
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.body = result.data;
    next();
  };
};
