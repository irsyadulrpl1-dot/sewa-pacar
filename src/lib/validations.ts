import { z } from "zod";

/**
 * Validation schemas for forms throughout the app
 */

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email harus diisi")
  .email("Format email tidak valid")
  .max(255, "Email terlalu panjang");

// Password validation
export const passwordSchema = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .max(100, "Password terlalu panjang");

// Username validation
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter")
  .max(30, "Username maksimal 30 karakter")
  .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore");

// Full name validation
export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama terlalu panjang");

// Bio validation
export const bioSchema = z
  .string()
  .trim()
  .max(500, "Bio maksimal 500 karakter")
  .optional()
  .or(z.literal(""));

// City validation
export const citySchema = z
  .string()
  .trim()
  .max(100, "Nama kota terlalu panjang")
  .optional()
  .or(z.literal(""));

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  username: usernameSchema,
  dateOfBirth: z.string().min(1, "Tanggal lahir harus diisi"),
  gender: z.enum(["male", "female", "prefer_not_to_say"], {
    required_error: "Pilih jenis kelamin",
  }),
  city: citySchema,
});

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: fullNameSchema,
  username: usernameSchema,
  city: citySchema,
  bio: bioSchema,
  interests: z.array(z.string().max(50)).max(20, "Maksimal 20 minat").optional(),
});

// Post creation schema
export const createPostSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(2000, "Caption maksimal 2000 karakter")
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string().max(50)).max(10, "Maksimal 10 tag").optional(),
});

// Comment schema
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Komentar tidak boleh kosong")
    .max(1000, "Komentar maksimal 1000 karakter"),
});

// Message schema
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong")
    .max(5000, "Pesan maksimal 5000 karakter"),
});

// Search schema
export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .max(100, "Query pencarian terlalu panjang"),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

/**
 * Validation helper function
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const firstError = result.error.errors[0];
  return {
    success: false,
    error: firstError?.message || "Validasi gagal",
  };
}

/**
 * Sanitize string input - removes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

/**
 * Safe URL encoding for external links
 */
export function safeEncodeURI(str: string): string {
  return encodeURIComponent(sanitizeString(str));
}
