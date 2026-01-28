import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/admin/userService';

/**
 * Hook to check admin authentication and authorization
 */
export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    const hasAdminRole = await UserService.checkAdminRole(user.id);
    setIsAdmin(hasAdminRole);
    setChecking(false);
  };

  return {
    isAdmin,
    checking: checking || authLoading,
    user,
  };
}