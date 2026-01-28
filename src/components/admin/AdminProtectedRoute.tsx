import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

/**
 * Component to protect admin routes
 * Only allows access if user has admin role
 */
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAdmin, checking } = useAdminAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}