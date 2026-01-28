import { Copy, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PaymentMethod, PaymentConfig } from "@/hooks/usePayments";
import { BankSelector } from "./BankSelector";
import { EWalletQR } from "./EWalletQR";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentInstructionsProps {
  method: PaymentMethod;
  amount: number;
  configs: PaymentConfig[];
  expiresAt?: string;
  paymentId?: string;
  onTransferDetailsChange?: (details: {
    sender_account_number?: string;
    sender_name?: string;
    transfer_amount?: number;
  }) => void;
}

export function PaymentInstructions({
  method,
  amount,
  configs,
  expiresAt,
  onTransferDetailsChange,
  paymentId,
}: PaymentInstructionsProps & { paymentId?: string }) {
  const { user } = useAuth();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin`);
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Kedaluwarsa";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} jam ${minutes} menit`;
  };

  const relevantConfigs = configs.filter((c) => c.method === method);
  const bankConfigs = configs.filter((c) => c.method === "bank_transfer");

  if (method === "cod") {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">Pembayaran COD</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Kamu akan membayar langsung saat bertemu dengan companion. Pastikan
                menyiapkan uang tunai sejumlah:
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground">Total Pembayaran</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatPrice(amount)}</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-xl">
          <h5 className="font-medium text-foreground text-sm mb-2">Langkah selanjutnya:</h5>
          <ol className="text-xs text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">1</span>
              Tunggu konfirmasi dari admin
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">2</span>
              Setelah disetujui, kamu bisa chat dengan companion
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">3</span>
              Bayar tunai saat bertemu
            </li>
          </ol>
        </div>
      </div>
    );
  }

  // Bank Transfer (Manual)
  if (method === "bank_transfer") {
    if (!paymentId || !user) {
      return (
        <div className="p-4 bg-muted/50 rounded-xl border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Memuat form pembayaran...
          </p>
        </div>
      );
    }

    // Bank Transfer instructions
    return (
      <div className="space-y-4">
        {expiresAt && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <Clock className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive font-medium">
              Batas waktu: {getTimeRemaining()}
            </span>
          </div>
        )}

        <BankSelector 
          banks={bankConfigs} 
          amount={amount} 
          onTransferDetailsChange={onTransferDetailsChange}
        />
      </div>
    );
  }

  // E-Wallet (DANA, GoPay, OVO, ShopeePay)
  const walletConfig = relevantConfigs[0];
  const walletNames: Record<string, string> = {
    dana: "DANA",
    gopay: "GoPay",
    ovo: "OVO",
    shopeepay: "ShopeePay",
  };

  return (
    <div className="space-y-4">
      {expiresAt && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <Clock className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive font-medium">
            Batas waktu: {getTimeRemaining()}
          </span>
        </div>
      )}

      {walletConfig ? (
        <EWalletQR
          wallet={walletConfig}
          amount={amount}
          walletName={walletNames[method] || method}
          onTransferDetailsChange={onTransferDetailsChange}
        />
      ) : (
        <div className="p-4 bg-muted/50 rounded-xl text-center border border-border">
          <p className="text-sm text-muted-foreground">
            Metode {walletNames[method] || method} belum tersedia saat ini
          </p>
        </div>
      )}
    </div>
  );
}
