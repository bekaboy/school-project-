import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: passwordSchema,
});

export const productSchema = z.object({
  genericName: z.string().min(1, 'Generic name is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  strength: z.string().min(1, 'Strength is required'),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  packSize: z.string().min(1, 'Pack size is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  countryOfOrigin: z.string().min(1, 'Country of origin is required'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  category: z.string().min(1, 'Category is required'),
  costPrice: z.number().positive('Cost price must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  taxRate: z.number().min(0).max(100),
  reorderQuantity: z.number().int().positive(),
  storageRequirements: z.string().optional(),
  description: z.string().optional(),
});

export const batchSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  manufacturingDate: z.string().min(1, 'Manufacturing date is required'),
  quantityReceived: z.number().int().positive('Quantity must be positive'),
  supplier: z.string().min(1, 'Supplier is required'),
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  taxId: z.string().optional(),
  licenseNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.number().positive().optional(),
});

export const salesOrderSchema = z.object({
  customerId: z.string().uuid('Customer is required'),
  deliveryAddress: z.string().optional(),
  specialInstructions: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        batchId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      }),
    )
    .min(1, 'At least one item is required'),
});

export const paymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
});

export const userSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  role: z.enum([
    'Sales Representative',
    'Store Manager',
    'Finance Officer',
    'Delivery Driver',
    'Technical Manager/Owner',
  ]),
});
