import { useState, useEffect } from "react";
import { Copy, CheckCircle2, QrCode, Smartphone, User, CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { PaymentConfig } from "@/hooks/usePayments";
import { motion } from "framer-motion";

interface EWalletQRProps {
  wallet: PaymentConfig;
  amount: number;
  walletName: string;
  onTransferDetailsChange?: (details: {
    sender_account_number?: string;
    sender_name?: string;
    transfer_amount?: number;
  }) => void;
}

const walletIcons: Record<string, React.ReactNode> = {
  gopay: <Smartphone className="w-6 h-6" />,
  dana: <Smartphone className="w-6 h-6" />,
  ovo: <Smartphone className="w-6 h-6" />,
};

export function EWalletQR({ wallet, amount, walletName, onTransferDetailsChange }: EWalletQRProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Transfer details form
  const [senderAccountNumber, setSenderAccountNumber] = useState("");
  const [senderName, setSenderName] = useState("");
  const [transferAmount, setTransferAmount] = useState(amount.toString());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const copyToClipboard = (text: string, label: string, field: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin`);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Update transfer details when form changes
  useEffect(() => {
    if (onTransferDetailsChange) {
      onTransferDetailsChange({
        sender_account_number: senderAccountNumber.trim() || undefined,
        sender_name: senderName.trim() || undefined,
        transfer_amount: transferAmount ? parseFloat(transferAmount.replace(/[^\d]/g, '')) : undefined,
      });
    }
  }, [senderAccountNumber, senderName, transferAmount, onTransferDetailsChange]);

  return (
    <div className="space-y-4">
      {/* Total Amount */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-center">
        <p className="text-xs text-muted-foreground mb-1">Total Pembayaran</p>
        <p className="text-3xl font-bold text-primary">{formatPrice(amount)}</p>
      </Card>

      {/* Wallet Info Card */}
      <Card className="p-5 border-2 border-primary/20 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {walletIcons[wallet.method] || <Smartphone className="w-6 h-6" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">{walletName}</p>
            <p className="text-xs text-muted-foreground">Dompet Digital</p>
          </div>
        </div>

        {/* QR Code */}
        {wallet.qr_code_url ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center p-4 bg-muted/30 rounded-xl">
              <div className="relative">
                <img
                  src={wallet.qr_code_url}
                  alt={`QR Code ${walletName}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Silakan scan QR Code di atas untuk melakukan pembayaran
            </p>
          </motion.div>
        ) : (
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <QrCode className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">QR Code tidak tersedia</p>
          </div>
        )}

        {/* Account Number */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Nomor {walletName}</p>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="font-mono font-semibold text-foreground text-lg">
                {wallet.account_number}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                a.n {wallet.account_name}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(wallet.account_number, "Nomor e-wallet", "account")}
              className="shrink-0"
            >
              {copiedField === "account" ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-3 border-t border-border space-y-2 mb-4">
          <p className="text-xs font-medium text-foreground">Cara Pembayaran:</p>
          <ol className="text-xs text-muted-foreground space-y-1.5 pl-4">
            <li className="list-decimal">
              {wallet.qr_code_url
                ? "Scan QR Code di atas menggunakan aplikasi " + walletName
                : `Buka aplikasi ${walletName} dan transfer ke nomor di atas`}
            </li>
            <li className="list-decimal">Pastikan nominal transfer tepat sesuai total pembayaran</li>
            <li className="list-decimal">Screenshot bukti pembayaran</li>
            <li className="list-decimal">Upload bukti pembayaran di bawah</li>
          </ol>
        </div>

        {/* Transfer Details Form */}
        <div className="pt-3 border-t border-border space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Informasi Transfer Anda
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Isi informasi di bawah ini agar admin dapat memverifikasi pembayaran Anda dengan lebih mudah.
            </p>
          </div>

          {/* Sender Account Number */}
          <div className="space-y-2">
            <Label htmlFor="sender-account-ewallet" className="text-xs font-medium">
              Nomor {walletName} / Kartu Pengirim
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="sender-account-ewallet"
                type="text"
                placeholder={`Contoh: 081234567890`}
                value={senderAccountNumber}
                onChange={(e) => setSenderAccountNumber(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Sender Name */}
          <div className="space-y-2">
            <Label htmlFor="sender-name-ewallet" className="text-xs font-medium">
              Nama Pengirim
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="sender-name-ewallet"
                type="text"
                placeholder="Nama sesuai akun/kartu"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Transfer Amount */}
          <div className="space-y-2">
            <Label htmlFor="transfer-amount-ewallet" className="text-xs font-medium">
              Jumlah Transfer
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="transfer-amount-ewallet"
                type="text"
                placeholder={formatPrice(amount)}
                value={transferAmount}
                onChange={(e) => {
                  // Allow only numbers and format
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setTransferAmount(value);
                }}
                className="pl-9 h-10 font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Jumlah yang Anda transfer (default: {formatPrice(amount)})
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

