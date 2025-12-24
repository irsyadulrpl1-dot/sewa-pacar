import { useState } from "react";
import { motion } from "framer-motion";
import { MobileLayout } from "@/components/MobileLayout";
import { useAdminPayments, type Payment } from "@/hooks/usePayments";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  User,
  Calendar,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminPayments = () => {
  const { user } = useAuth();
  const { payments, loading, validatePayment } = useAdminPayments();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
  };

  const methodLabels: Record<string, string> = {
    cod: "COD",
    bank_transfer: "Transfer Bank",
    dana: "DANA",
    gopay: "GoPay",
    ovo: "OVO",
    shopeepay: "ShopeePay",
  };

  const handleValidate = async (status: "approved" | "rejected") => {
    if (!selectedPayment) return;

    setIsValidating(true);
    const success = await validatePayment(selectedPayment.id, status, adminNotes);
    setIsValidating(false);

    if (success) {
      setSelectedPayment(null);
      setAdminNotes("");
    }
  };

  const pendingPayments = payments.filter(
    (p) => p.status === "pending" || p.status === "waiting_validation"
  );
  const completedPayments = payments.filter(
    (p) => p.status === "approved" || p.status === "rejected" || p.status === "cancelled"
  );

  if (!user) {
    return (
      <MobileLayout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-display font-bold text-foreground mb-2">
              Akses Ditolak
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Silakan login sebagai admin
            </p>
            <Button variant="gradient" asChild>
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showFooter={false}>
      <main className="pt-4 md:pt-24 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                Admin Pembayaran
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola dan validasi pembayaran
              </p>
            </div>
          </motion.div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="relative">
                Menunggu
                {pendingPayments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {pendingPayments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              )}

              {!loading && pendingPayments.length === 0 && (
                <div className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">Tidak ada pembayaran menunggu</p>
                </div>
              )}

              {!loading &&
                pendingPayments.map((payment, index) => {
                  const bookingDetails = payment.booking_details as {
                    companion_name?: string;
                    package_name?: string;
                    package_duration?: string;
                  } | null;

                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-card rounded-xl border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {bookingDetails?.companion_name || "Booking"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bookingDetails?.package_name}
                          </p>
                        </div>
                        <PaymentStatusBadge status={payment.status} size="sm" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(payment.created_at)}
                        </div>
                        <div className="text-right font-semibold text-foreground">
                          {formatPrice(payment.amount)}
                        </div>
                        <div>{methodLabels[payment.method]}</div>
                        {payment.proof_url && (
                          <div className="flex items-center gap-1 justify-end text-primary">
                            <ImageIcon className="w-3 h-3" />
                            Bukti tersedia
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Lihat & Validasi
                      </Button>
                    </motion.div>
                  );
                })}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {loading && (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              )}

              {!loading && completedPayments.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">Belum ada riwayat</p>
                </div>
              )}

              {!loading &&
                completedPayments.map((payment) => {
                  const bookingDetails = payment.booking_details as {
                    companion_name?: string;
                    package_name?: string;
                  } | null;

                  return (
                    <div
                      key={payment.id}
                      className="p-3 bg-card rounded-xl border border-border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {bookingDetails?.companion_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                        <PaymentStatusBadge status={payment.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Validation Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pembayaran</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              {/* Payment Info */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Metode</span>
                  <span className="font-medium text-foreground">
                    {methodLabels[selectedPayment.method]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jumlah</span>
                  <span className="font-semibold text-primary">
                    {formatPrice(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal</span>
                  <span className="text-foreground text-sm">
                    {formatDate(selectedPayment.created_at)}
                  </span>
                </div>
              </div>

              {/* Proof Image */}
              {selectedPayment.proof_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Bukti Pembayaran:</p>
                  <img
                    src={selectedPayment.proof_url}
                    alt="Bukti pembayaran"
                    className="w-full rounded-xl border border-border"
                  />
                </div>
              )}

              {/* Notes from User */}
              {selectedPayment.notes && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Catatan User:</p>
                  <p className="text-sm text-foreground">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Admin Notes Input */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Catatan Admin:</p>
                <Textarea
                  placeholder="Tambahkan catatan (wajib jika ditolak)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleValidate("rejected")}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Tolak
                    </>
                  )}
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => handleValidate("approved")}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Setujui
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default AdminPayments;
