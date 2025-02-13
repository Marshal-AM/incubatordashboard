import * as z from "zod"

export const serviceProviderSignUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  serviceProviderType: z.enum([
    "Incubator",
    "Accelerator",
    "Institution/University",
    "Private Coworking Space",
    "Community Space",
    "Cafe"
  ], {
    required_error: "Please select a service provider type",
  }),
  serviceName: z.string().min(1, "Service name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  zipPostalCode: z.string().min(1, "ZIP/Postal Code is required"),
  primaryContact1Name: z.string().min(1, "Primary contact name is required"),
  primaryContact1Designation: z.string().min(1, "Primary contact designation is required"),
  primaryContactNumber: z.string().min(1, "Primary contact number is required"),
  contact2Name: z.string().optional(),
  contact2Designation: z.string().optional(),
  alternateContactNumber: z.string().optional(),
  alternateEmailId: z.string().email("Please enter a valid email address").optional(),
  websiteUrl: z.string().url("Please enter a valid URL").optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
})

export const startupSignUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  startupName: z.string().min(1, "Startup name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
})

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
}) 