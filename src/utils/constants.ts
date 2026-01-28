/**
 * Application Constants
 * Centralized constants used throughout the app
 */

// ==================== API & Configuration ====================
export const API_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ==================== File Upload ====================
export const FILE_UPLOAD = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
} as const;

// ==================== Pagination ====================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ==================== Date & Time ====================
export const DATE_FORMAT = {
  DISPLAY: "dd MMMM yyyy",
  DISPLAY_SHORT: "dd MMM yyyy",
  DISPLAY_WITH_TIME: "dd MMMM yyyy HH:mm",
  TIME_ONLY: "HH:mm",
  ISO: "yyyy-MM-dd",
} as const;

// ==================== Validation ====================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_BIO_LENGTH: 500,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_COMMENT_LENGTH: 1000,
} as const;

// ==================== Routes ====================
export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  MESSAGES: "/messages",
  CHAT: "/chat",
  FRIENDS: "/friends",
  FIND_FRIENDS: "/find-friends",
  BOOKINGS: "/bookings",
  BOOKING_DETAIL: "/bookings",
  PAYMENT_HISTORY: "/payment-history",
  NOTIFICATIONS: "/notifications",
  COMPANION_PROFILE: "/companion",
  COMPANION_CHAT: "/companion-chat",
  INFO: "/info",
  RULES: "/rules",
  CONTACT: "/contact",
  ADMIN_PAYMENTS: "/admin/payments",
} as const;

// ==================== Storage Keys ====================
export const STORAGE_KEYS = {
  THEME: "theme",
  LANGUAGE: "language",
  LAST_VISITED: "last_visited",
} as const;

// ==================== Notification Types ====================
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: "friend_request",
  FRIEND_ACCEPTED: "friend_accepted",
  PAYMENT_APPROVED: "payment_approved",
  PAYMENT_REJECTED: "payment_rejected",
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_CANCELLED: "booking_cancelled",
  MESSAGE_RECEIVED: "message_received",
} as const;

// ==================== Booking Status ====================
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

// ==================== Payment Status ====================
export const PAYMENT_STATUS = {
  PENDING: "pending",
  WAITING_VALIDATION: "waiting_validation",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

// ==================== Payment Methods ====================
export const PAYMENT_METHODS = {
  COD: "cod",
  BANK_TRANSFER: "bank_transfer",
  DANA: "dana",
  GOPAY: "gopay",
  OVO: "ovo",
  SHOPEEPAY: "shopeepay",
} as const;

// ==================== Error Messages ====================
export const ERROR_MESSAGES = {
  NETWORK: "Koneksi internet bermasalah. Silakan coba lagi.",
  UNAUTHORIZED: "Sesi Anda telah berakhir. Silakan login kembali.",
  FORBIDDEN: "Anda tidak memiliki izin untuk melakukan aksi ini.",
  NOT_FOUND: "Data tidak ditemukan.",
  SERVER_ERROR: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
  VALIDATION_ERROR: "Data yang dimasukkan tidak valid.",
  UNKNOWN: "Terjadi kesalahan yang tidak diketahui.",
} as const;

// ==================== Success Messages ====================
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profil berhasil diperbarui",
  BOOKING_CREATED: "Pemesanan berhasil dibuat",
  PAYMENT_CREATED: "Pembayaran berhasil dibuat",
  MESSAGE_SENT: "Pesan berhasil dikirim",
  FOLLOW_SUCCESS: "Berhasil mengikuti",
  UNFOLLOW_SUCCESS: "Berhenti mengikuti",
  FRIEND_REQUEST_SENT: "Permintaan pertemanan berhasil dikirim",
} as const;

