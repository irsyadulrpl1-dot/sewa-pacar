import { useState, useEffect } from 'react';
import { DashboardService } from '@/services/admin/dashboardService';
import { DashboardStats } from '@/types/admin';

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRenters: 0,
    totalCompanions: 0,
    totalBookings: 0,
    todayBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    verifiedCompanions: 0,
    unverifiedCompanions: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const data = await DashboardService.fetchDashboardStats();
    setStats(data);
    setLoading(false);
  };

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}