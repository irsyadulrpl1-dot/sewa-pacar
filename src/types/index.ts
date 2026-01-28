/**
 * Centralized Type Definitions
 * All shared types and interfaces should be defined here
 */

// ==================== Auth & User ====================
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export type UserRole = "renter" | "companion";

export interface Profile {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  role?: UserRole | null;
  is_verified: boolean;
  is_online: boolean;
  hourly_rate: number | null;
  availability: string | null;
  personality: string[] | null;
  activities: string[] | null;
  interests: string[] | null;
  packages: { name: string; duration: string; price: number }[] | null;
  created_at: string;
  updated_at: string;
}

// ==================== Booking ====================
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  user_id: string;
  companion_id: string | null;
  package_name: string;
  package_duration: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_amount: number;
  status: BookingStatus;
  notes: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithPayment extends Booking {
  payment?: {
    id: string;
    method: string;
    status: string;
    proof_url: string | null;
    validated_at: string | null;
    created_at: string;
  } | null;
  companion_name?: string;
  companion_image?: string;
}

// ==================== Payment ====================
export type PaymentStatus = 
  | "pending" 
  | "waiting_validation" 
  | "approved" 
  | "rejected" 
  | "cancelled" 
  | "expired";

export type PaymentMethod = 
  | "cod" 
  | "bank_transfer" 
  | "dana" 
  | "gopay" 
  | "ovo" 
  | "shopeepay";

export interface Payment {
  id: string;
  user_id: string;
  companion_id: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proof_url: string | null;
  notes: string | null;
  admin_notes: string | null;
  validated_by: string | null;
  validated_at: string | null;
  expires_at: string | null;
  booking_details: {
    companion_name?: string;
    companion_id?: string;
    package_name?: string;
    package_duration?: string;
    booking_date?: string;
    booking_time?: string;
    duration_hours?: number;
    transfer_details?: {
      sender_account_number?: string;
      sender_name?: string;
      transfer_amount?: number;
    };
  } | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentConfig {
  id: string;
  method: PaymentMethod;
  bank_name: string | null;
  account_number: string;
  account_name: string;
  qr_code_url: string | null;
  is_active: boolean;
}

// ==================== Chat & Messages ====================
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  partner: Profile | null;
  lastMessage: Message | null;
  unreadCount: number;
  hasBooking?: boolean;
}

// ==================== Companion ====================
export interface Companion {
  user_id: string;
  id: string;
  name: string;
  full_name?: string;
  age?: number;
  city: string;
  rating: number;
  hourlyRate: number;
  hourly_rate?: number;
  image: string;
  avatar_url?: string;
  bio: string;
  description?: string;
  personality: string[];
  activities: string[];
  availability: string;
  packages: { name: string; duration: string; price: number }[];
  is_online?: boolean;
  created_at?: string;
}

export interface CompanionFilters {
  search?: string;
  city?: string;
  availability?: string;
  onlineOnly?: boolean;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "created_at";
  limit?: number;
}

// ==================== Follow & Friends ====================
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type FriendStatus = "none" | "friends" | "request_sent" | "request_received";

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

// ==================== Notification ====================
export type NotificationType = 
  | "friend_request"
  | "friend_accepted"
  | "payment_approved"
  | "payment_rejected"
  | "booking_confirmed"
  | "booking_cancelled"
  | "message_received";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ==================== API Response ====================
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== Form & Validation ====================
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ==================== Utility Types ====================
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

