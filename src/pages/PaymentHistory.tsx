import { motion } from "framer-motion";
import { MobileLayout } from "@/components/MobileLayout";
import { usePayments } from "@/hooks/usePayments";
import { PaymentHistoryCard } from "@/components/payments/PaymentHistoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const PaymentHistory = () => {
  const { user } = useAuth();
  const { payments, loading, cancelPayment } = usePayments();

  if (!user) {
    return (
      <MobileLayout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-display font-bold text-foreground mb-2">
              Silakan Login
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Login untuk melihat riwayat pembayaran
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
            <Link
              to="/profile"
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                Riwayat Pembayaran
              </h1>
              <p className="text-sm text-muted-foreground">
                Lihat status pesanan kamu
              </p>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && payments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 text-center"
            >
              <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                <Receipt className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum Ada Pembayaran
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Booking companion dan pembayaran akan muncul di sini
              </p>
              <Button variant="gradient" asChild>
                <Link to="/companions">Cari Companion</Link>
              </Button>
            </motion.div>
          )}

          {/* Payment List */}
          {!loading && payments.length > 0 && (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PaymentHistoryCard
                    payment={payment}
                    onCancel={cancelPayment}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </MobileLayout>
  );
};

export default PaymentHistory;
