import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  Package,
  User,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  CreditCard,
  Sparkles,
  FileText,
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBookingsHistory } from "@/hooks/useBookingsHistory";
import { usePayments, PaymentMethod } from "@/hooks/usePayments";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BookingDetail() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getBookingById } = useBookingsHistory();
  const { uploadPaymentProof, paymentConfigs, fetchPaymentConfigs } = usePayments();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  useEffect(() => {
    fetchPaymentConfigs();
  }, []);

  const loadBooking = async () => {
    if (!bookingId) return;
    setLoading(true);
    const data = await getBookingById(bookingId);
    setBooking(data);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, d MMMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const calculateEndTime = (startTime: string, durationHours: number) => {
    try {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      startDate.setHours(startDate.getHours() + durationHours);
      return format(startDate, "HH:mm");
    } catch {
      return "-";
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-500",
      waiting_validation: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      confirmed: "bg-green-500",
      completed: "bg-blue-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Belum Bayar",
      waiting_validation: "Menunggu Validasi",
      approved: "Berhasil",
      rejected: "Ditolak",
      confirmed: "Dikonfirmasi",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getTimelineSteps = () => {
    if (!booking) return [];
    const steps = [];
    
    // Step 1: Pesanan dibuat
    steps.push({
      label: "Pesanan Dibuat",
      status: "completed",
      date: booking.created_at,
    });

    // Step 2: Pembayaran dilakukan
    if (booking.payment) {
      steps.push({
        label: "Pembayaran Dilakukan",
        status: booking.payment.status === "pending" ? "pending" : "completed",
        date: booking.payment.created_at,
      });
    }

    // Step 3: Menunggu validasi
    if (booking.payment?.status === "waiting_validation") {
      steps.push({
        label: "Menunggu Validasi",
        status: "pending",
        date: booking.payment.created_at,
      });
    }

    // Step 4: Pemesanan dikonfirmasi
    if (booking.status === "confirmed" || booking.status === "completed") {
      steps.push({
        label: "Pemesanan Dikonfirmasi",
        status: "completed",
        date: booking.updated_at,
      });
    }

    // Step 5: Selesai
    if (booking.status === "completed") {
      steps.push({
        label: "Selesai",
        status: "completed",
        date: booking.updated_at,
      });
    }

    return steps;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type) && !file.type.startsWith("image/")) {
        toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau PDF.");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Ukuran file melebihi 5MB. Silakan pilih file yang lebih kecil.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !booking?.payment?.id) {
      toast.error("Silakan pilih file terlebih dahulu");
      return;
    }

    setUploading(true);
    try {
      await uploadPaymentProof(booking.payment.id, selectedFile);
      setShowUploadDialog(false);
      setSelectedFile(null);
      await loadBooking();
      toast.success("Bukti pembayaran berhasil diupload");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupload bukti pembayaran");
    } finally {
      setUploading(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: "Transfer Bank",
      dana: "DANA",
      gopay: "GoPay",
      ovo: "OVO",
      shopeepay: "ShopeePay",
      cod: "Cash on Delivery",
    };
    return labels[method] || method;
  };

  const getPaymentConfig = (method: PaymentMethod) => {
    return paymentConfigs.find((config) => config.method === method);
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Sparkles className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!booking) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Pemesanan tidak ditemukan</p>
          <Button onClick={() => navigate("/bookings")}>Kembali ke Riwayat</Button>
        </div>
      </MobileLayout>
    );
  }

  const timelineSteps = getTimelineSteps();
  const paymentConfig = booking.payment
    ? getPaymentConfig(booking.payment.method as PaymentMethod)
    : null;

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 max-w-4xl py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/bookings")}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Detail Pemesanan
              </h1>
              <p className="text-muted-foreground mt-1">
                ID: {booking.id.substring(0, 8)}...
              </p>
            </div>
            <Badge
              className={`${getStatusColor(booking.status)} text-white`}
            >
              {getStatusLabel(booking.status)}
            </Badge>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Informasi Pemesanan */}
          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Informasi Pemesanan
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nama Companion</Label>
                  <p className="font-medium text-foreground mt-1">
                    {booking.companion_name || "Companion"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Paket</Label>
                  <p className="font-medium text-foreground mt-1">
                    {booking.package_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Durasi Paket</Label>
                  <p className="font-medium text-foreground mt-1">
                    {booking.package_duration}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Durasi Pemesanan</Label>
                  <p className="font-medium text-foreground mt-1">
                    {booking.duration_hours} jam
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tanggal</Label>
                  <p className="font-medium text-foreground mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(booking.booking_date)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Waktu</Label>
                  <p className="font-medium text-foreground mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatTime(booking.booking_time)} -{" "}
                    {calculateEndTime(booking.booking_time, booking.duration_hours)}
                  </p>
                </div>
              </div>
              {booking.notes && (
                <div>
                  <Label className="text-muted-foreground">Catatan</Label>
                  <p className="text-foreground mt-1">{booking.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Informasi Pembayaran */}
          {booking.payment && (
            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Informasi Pembayaran
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Total Harga</Label>
                    <p className="font-bold text-primary text-xl mt-1">
                      {formatPrice(booking.total_amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Metode Pembayaran</Label>
                    <p className="font-medium text-foreground mt-1">
                      {getPaymentMethodLabel(booking.payment.method)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status Pembayaran</Label>
                    <Badge
                      className={`${getStatusColor(booking.payment.status)} text-white mt-1`}
                    >
                      {getStatusLabel(booking.payment.status)}
                    </Badge>
                  </div>
                </div>

                {/* Payment Details */}
                {paymentConfig && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">
                      Detail Pembayaran
                    </h3>
                    {paymentConfig.bank_name && (
                      <p className="text-sm text-muted-foreground">
                        Bank: {paymentConfig.bank_name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Nomor: {paymentConfig.account_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Atas Nama: {paymentConfig.account_name}
                    </p>
                    {paymentConfig.qr_code_url && (
                      <div className="mt-3">
                        <img
                          src={paymentConfig.qr_code_url}
                          alt="QR Code"
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Proof */}
                {booking.payment.proof_url && (
                  <div className="mt-4">
                    <Label className="text-muted-foreground">Bukti Pembayaran</Label>
                    <div className="mt-2">
                      <a
                        href={booking.payment.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Lihat Bukti Pembayaran
                      </a>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {booking.payment.admin_notes && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <Label className="text-muted-foreground">Catatan Admin</Label>
                    <p className="text-foreground mt-1">{booking.payment.admin_notes}</p>
                  </div>
                )}

                {/* Payment Actions */}
                {booking.payment.status === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => setShowUploadDialog(true)}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Bukti Pembayaran
                    </Button>
                  </div>
                )}
                {booking.payment.status === "waiting_validation" && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      Pembayaran sedang menunggu validasi admin. Kami akan memproses dalam 1x24 jam.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Timeline Status
            </h2>
            <div className="space-y-4">
              {timelineSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === "completed"
                          ? "bg-green-500 text-white"
                          : step.status === "pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : step.status === "pending" ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          step.status === "completed" ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-foreground">{step.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(step.date), "d MMM yyyy, HH:mm", { locale: id })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Upload Proof Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Pilih File</Label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: JPG, PNG, PDF (max 5MB)
                </p>
              </div>
              {selectedFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false);
                    setSelectedFile(null);
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUploadProof}
                  disabled={!selectedFile || uploading}
                  className="flex-1"
                >
                  {uploading ? "Mengupload..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}

