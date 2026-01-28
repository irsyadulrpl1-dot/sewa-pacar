import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { user } = useAuth();
  
  // Only show notification bell if user is logged in
  if (!user) return null;

  // Use hook - it will handle errors internally
  const { unreadCount } = useNotifications();
 
  return (
    <Link
      to="/notifications"
      className={cn(
        "relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors",
        className
      )}
    >
      <Bell className="w-5 h-5 text-foreground" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </motion.div>
      )}
    </Link>
  );
}

