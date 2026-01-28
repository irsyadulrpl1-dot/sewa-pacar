// Admin Type Definitions
export type BookingStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'completed' 
  | 'cancelled';

export type UserRole = 'renter' | 'companion';

export interface AdminUser {
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  gender: string | null;
  city: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  is_verified: boolean | null;
  is_online: boolean | null;
  created_at: string;
  role?: UserRole | null;
  hourly_rate?: number | null;
  is_account_active?: boolean;
}

export interface CompanionExtended extends AdminUser {
  hourly_rate: number | null;
  availability?: string | null;
  personality?: string[] | null;
  activities?: string[] | null;
  rating?: number;
}

export interface AdminBooking {
  id: string;
  renter_id: string;
  companion_id: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  total_price: number;
  status: BookingStatus;
  location?: string;
  notes?: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  renter_name?: string;
  renter_email?: string;
  companion_name?: string;
  companion_avatar?: string;
  status_history?: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  status: BookingStatus;
  timestamp: string;
  notes?: string;
  changed_by?: string;
}

export interface BookingFilters {
  status?: BookingStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  companionId?: string;
  searchTerm?: string;
}

export interface DashboardStats {
  totalRenters: number;
  totalCompanions: number;
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  verifiedCompanions: number;
  unverifiedCompanions: number;
  pendingPayments: number;
}

export interface AdminActionRequest {
  bookingId: string;
  action: 'approve' | 'reject' | 'cancel';
  notes?: string;
}