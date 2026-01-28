/**
 * Data Helper Functions
 * Utility functions for data manipulation and validation
 */

import type { Profile, Booking, Payment, Message, Companion } from "@/types";

// ==================== Null Safety ====================
/**
 * Safely get value or return default
 */
export function safeGet<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * Safely get array or return empty array
 */
export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safely get string or return empty string
 */
export function safeString(value: string | null | undefined): string {
  return value ?? "";
}

/**
 * Safely get number or return 0
 */
export function safeNumber(value: number | null | undefined): number {
  return value ?? 0;
}

// ==================== Array Helpers ====================
/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return Array.from(new Set(array));
  }
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return direction === "asc" ? comparison : -comparison;
  });
}

// ==================== Date Helpers ====================
/**
 * Format date to Indonesian format
 */
export function formatDate(date: string | Date, format: "long" | "short" = "long"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return "Tanggal tidak valid";
  }

  const options: Intl.DateTimeFormatOptions = format === "long"
    ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    : { year: "numeric", month: "short", day: "numeric" };

  return d.toLocaleDateString("id-ID", options);
}

/**
 * Format time
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return "";
  }

  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Get relative time (e.g., "2 jam yang lalu")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} hari yang lalu`;
  }
  if (hours > 0) {
    return `${hours} jam yang lalu`;
  }
  if (minutes > 0) {
    return `${minutes} menit yang lalu`;
  }
  return "Baru saja";
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

// ==================== UUID Validation ====================
/**
 * Check if string is valid UUID
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// ==================== Data Transformation ====================
/**
 * Normalize companion data
 */
export function normalizeCompanion(data: any): Companion {
  return {
    user_id: data.user_id || data.id || "",
    id: data.user_id || data.id || "",
    name: data.full_name || data.name || "Unknown",
    full_name: data.full_name || data.name,
    age: data.age || calculateAge(data.date_of_birth),
    city: safeString(data.city),
    rating: data.is_verified ? 4.5 : 4.0,
    hourlyRate: safeNumber(data.hourly_rate),
    hourly_rate: safeNumber(data.hourly_rate),
    image: data.avatar_url || data.image || "/placeholder-avatar.png",
    avatar_url: data.avatar_url || data.image,
    bio: safeString(data.bio),
    description: safeString(data.bio),
    personality: safeArray(data.personality),
    activities: safeArray(data.activities),
    availability: safeString(data.availability),
    packages: safeArray(data.packages),
    is_online: data.is_online || false,
    created_at: data.created_at || new Date().toISOString(),
  };
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string | null | undefined): number {
  if (!dateOfBirth) return 0;
  
  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// ==================== Search & Filter ====================
/**
 * Search in array
 */
export function searchInArray<T>(
  array: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query.trim()) return array;
  
  const lowerQuery = query.toLowerCase();
  return array.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return String(value).toLowerCase().includes(lowerQuery);
    })
  );
}

/**
 * Filter array by multiple conditions
 */
export function filterArray<T>(
  array: T[],
  filters: Partial<Record<keyof T, unknown>>
): T[] {
  return array.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === "") return true;
      return item[key as keyof T] === value;
    })
  );
}

// ==================== Debounce & Throttle ====================
/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

