import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout } from "@/components/MobileLayout";
import { useNotifications, type NotificationType } from "@/hooks/useNotifications";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  CheckCheck,
  Filter,
  X,
  CreditCard,
  Calendar,
  Ban,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  payment_approved: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  payment_rejected: <XCircle className="w-5 h-5 text-red-500" />,
  payment_pending: <Clock className="w-5 h-5 text-yellow-500" />,
  booking_confirmed: <Calendar className="w-5 h-5 text-blue-500" />,
  booking_cancelled: <Ban className="w-5 h-5 text-gray-500" />,
  system_announcement: <Megaphone className="w-5 h-5 text-purple-500" />,
  payment_created: <CreditCard className="w-5 h-5 text-blue-500" />,
  payment_expired: <AlertCircle className="w-5 h-5 text-orange-500" />,
};

const notificationColors: Record<NotificationType, string> = {
  payment_approved: "bg-green-500/10 border-green-500/20",
  payment_rejected: "bg-red-500/10 border-red-500/20",
  payment_pending: "bg-yellow-500/10 border-yellow-500/20",
  booking_confirmed: "bg-blue-500/10 border-blue-500/20",
  booking_cancelled: "bg-gray-500/10 border-gray-500/20",
  system_announcement: "bg-purple-500/10 border-purple-500/20",
  payment_created: "bg-blue-500/10 border-blue-500/20",
  payment_expired: "bg-orange-500/10 border-orange-500/20",
};

const typeLabels: Record<NotificationType, string> = {
  payment_approved: "Pembayaran Disetujui",
  payment_rejected: "Pembayaran Ditolak",
  payment_pending: "Pembayaran Pending",
  booking_confirmed: "Booking Dikonfirmasi",
  booking_cancelled: "Booking Dibatalkan",
  system_announcement: "Pengumuman Sistem",
  payment_created: "Pembayaran Dibuat",
  payment_expired: "Pembayaran Kedaluwarsa",
};

export default function Notifications() {
  const {
    notifications,
    loading,
    unreadCount,
    tableExists,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch notifications with error display when page loads or filter changes
  useEffect(() => {
    // Fetch with error display enabled
    const currentFilter = filter === "all" ? undefined : filter;
    fetchNotifications(currentFilter, true);
  }, [filter]); // Only depend on filter, fetchNotifications is stable

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus notifikasi ini?")) {
      await deleteNotification(id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAllRead = async () => {
    if (confirm("Hapus semua notifikasi yang sudah dibaca?")) {
      await deleteAllRead();
    }
  };

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                Notifikasi 🔔
              </h1>
              <p className="text-muted-foreground text-sm">
                {unreadCount > 0
                  ? `${unreadCount} notifikasi belum dibaca`
                  : "Semua sudah dibaca"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="w-4 h-4" />
                {filter !== "all" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="flex-1"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Tandai Semua Dibaca
                </Button>
              )}
              {notifications.filter((n) => n.is_read).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllRead}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus yang Dibaca
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-xl">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFilter("all");
                    setShowFilters(false);
                  }}
                >
                  Semua
                </Button>
                {Object.entries(typeLabels).map(([type, label]) => (
                  <Button
                    key={type}
                    variant={filter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilter(type as NotificationType);
                      setShowFilters(false);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Migration Required Message */}
        {tableExists === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-destructive/10 border-2 border-destructive/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-2">
                  ⚠️ Tabel Notifikasi Belum Dibuat
                </h3>
                <p className="text-sm text-foreground mb-4">
                  Tabel <code className="bg-muted px-1.5 py-0.5 rounded text-xs">notifications</code> belum ada di database. 
                  Migration perlu dijalankan terlebih dahulu.
                </p>
                <div className="space-y-3">
                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <p className="font-semibold text-sm mb-2">📋 Langkah-langkah:</p>
                    <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
                      <li>Buka <strong className="text-foreground">Supabase Dashboard</strong> → <strong className="text-foreground">SQL Editor</strong></li>
                      <li>Buka file <code className="bg-muted px-1.5 py-0.5 rounded text-xs">RUN_THIS_MIGRATION.sql</code> di project Anda</li>
                      <li>Copy <strong className="text-foreground">semua isi</strong> file tersebut</li>
                      <li>Paste ke SQL Editor di Supabase Dashboard</li>
                      <li>Klik <strong className="text-foreground">RUN</strong> atau tekan <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">Ctrl+Enter</kbd></li>
                      <li>Tunggu sampai muncul <strong className="text-green-500">"Success"</strong></li>
                      <li><strong className="text-foreground">Refresh browser</strong> setelah migration selesai</li>
                    </ol>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const instructions = `CARA JALANKAN MIGRATION:

1. Buka Supabase Dashboard → SQL Editor
2. Buka file RUN_THIS_MIGRATION.sql di root project
3. Copy SEMUA isi file tersebut (Ctrl+A, Ctrl+C)
4. Paste ke SQL Editor di Supabase (Ctrl+V)
5. Klik RUN atau tekan Ctrl+Enter
6. Tunggu sampai muncul "Success"
7. Refresh browser (F5)`;
                        navigator.clipboard.writeText(instructions);
                        toast.success('Instruksi disalin! Buka Supabase Dashboard → SQL Editor', {
                          duration: 6000,
                        });
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Salin Instruksi
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => {
                        window.location.reload();
                      }}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : tableExists === false ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Migration Diperlukan
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tabel notifications belum dibuat. Silakan jalankan migration terlebih dahulu.
            </p>
          </motion.div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <Bell className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tidak ada notifikasi
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === "all"
                ? "Kamu belum memiliki notifikasi"
                : `Tidak ada notifikasi dengan filter "${typeLabels[filter as NotificationType]}"`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    notification.is_read
                      ? "bg-card border-border"
                      : "bg-primary/5 border-primary/20",
                    notificationColors[notification.type]
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {notificationIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-sm">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.metadata && (
                            <div className="mt-2 space-y-1">
                              {notification.metadata.payment_amount && (
                                <Badge variant="outline" className="text-xs">
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                  }).format(notification.metadata.payment_amount)}
                                </Badge>
                              )}
                              {notification.metadata.companion_name && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.metadata.companion_name}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-7 px-2 text-xs"
                            >
                              Tandai Dibaca
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

