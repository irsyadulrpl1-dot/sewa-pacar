import { Copy, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PaymentMethod, PaymentConfig } from "@/hooks/usePayments";

interface PaymentInstructionsProps {
  method: PaymentMethod;
  amount: number;
  configs: PaymentConfig[];
  expiresAt?: string;
}

export function PaymentInstructions({
  method,
  amount,
  configs,
  expiresAt,
}: PaymentInstructionsProps) {
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

  if (method === "bank_transfer") {
    return (
      <div className="space-y-4">
        {expiresAt && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <Clock className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive font-medium">
              Batas waktu: {getTimeRemaining()}
            </span>
          </div>
        )}

        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground">Total Pembayaran</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatPrice(amount)}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm">Pilih Rekening Tujuan:</h4>
          {bankConfigs.map((config) => (
            <div
              key={config.id}
              className="p-4 bg-card rounded-xl border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-foreground">{config.bank_name}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor Rekening</p>
                    <p className="font-mono font-semibold text-foreground">
                      {config.account_number}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(config.account_number, "Nomor rekening")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Atas Nama</p>
                    <p className="font-semibold text-foreground">{config.account_name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-muted/50 rounded-xl">
          <h5 className="font-medium text-foreground text-sm mb-2">Petunjuk Transfer:</h5>
          <ol className="text-xs text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">1</span>
              Transfer sesuai nominal ke rekening di atas
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">2</span>
              Simpan bukti transfer
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">3</span>
              Upload bukti transfer di bawah
            </li>
          </ol>
        </div>
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
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
          <Clock className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive font-medium">
            Batas waktu: {getTimeRemaining()}
          </span>
        </div>
      )}

      <div className="p-4 bg-card rounded-xl border border-border text-center">
        <p className="text-xs text-muted-foreground">Total Pembayaran</p>
        <p className="text-2xl font-bold text-primary mt-1">{formatPrice(amount)}</p>
      </div>

      {walletConfig ? (
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">{walletNames[method]}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Nomor {walletNames[method]}</p>
              <p className="font-mono font-semibold text-foreground text-lg">
                {walletConfig.account_number}
              </p>
              <p className="text-xs text-muted-foreground">a.n {walletConfig.account_name}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(walletConfig.account_number, "Nomor e-wallet")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-muted/50 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            Metode {walletNames[method]} belum tersedia saat ini
          </p>
        </div>
      )}

      <div className="p-4 bg-muted/50 rounded-xl">
        <h5 className="font-medium text-foreground text-sm mb-2">Petunjuk Pembayaran:</h5>
        <ol className="text-xs text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">1</span>
            Buka aplikasi {walletNames[method]}
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">2</span>
            Transfer ke nomor di atas sesuai nominal
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">3</span>
            Screenshot bukti pembayaran
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs shrink-0">4</span>
            Upload bukti di bawah
          </li>
        </ol>
      </div>
    </div>
  );
}
