import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Sparkles } from "lucide-react";

export type AppUserRole = "renter" | "companion";

interface RequireRoleProps {
  children: ReactNode;
  /**
   * If provided, only allow these roles.
   * If omitted, any selected role is allowed.
   */
  allowedRoles?: AppUserRole[];
  /**
   * If true (default), user must have chosen a role.
   * Set to false for the /choose-role page itself.
   */
  requireRoleSelected?: boolean;
}

export function RequireRole({
  children,
  allowedRoles,
  requireRoleSelected = true,
}: RequireRoleProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Sparkles className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirectParam}`} replace />;
  }

  const role = (profile?.role ?? null) as AppUserRole | null;

  if (requireRoleSelected && !role) {
    return <Navigate to="/choose-role" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}


