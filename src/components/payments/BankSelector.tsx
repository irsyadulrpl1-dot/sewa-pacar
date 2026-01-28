import { useState, useMemo, useEffect } from "react";
import { Copy, CheckCircle2, Building2, Search, User, CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { PaymentConfig } from "@/hooks/usePayments";
import { motion } from "framer-motion";

interface BankSelectorProps {
  banks: PaymentConfig[];
  amount: number;
  onBankSelect?: (bank: PaymentConfig) => void;
  onTransferDetailsChange?: (details: {
    sender_account_number?: string;
    sender_name?: string;
    transfer_amount?: number;
  }) => void;
}

// Bank logos dengan emoji yang lebih representatif
const bankLogos: Record<string, string> = {
  BCA: "🏦",
  BRI: "🏛️",
  Mandiri: "🏢",
  "Bank Mandiri": "🏢",
  "Bank BCA": "🏦",
  "Bank BRI": "🏛️",
};

// Bank colors untuk styling
const bankColors: Record<string, { bg: string; text: string; border: string }> = {
  BCA: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  BRI: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Mandiri: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Bank Mandiri": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Bank BCA": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Bank BRI": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

export function BankSelector({ banks, amount, onBankSelect, onTransferDetailsChange }: BankSelectorProps) {
  const [selectedBank, setSelectedBank] = useState<PaymentConfig | null>(banks[0] || null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Transfer details form
  const [senderAccountNumber, setSenderAccountNumber] = useState("");
  const [senderName, setSenderName] = useState("");
  const [transferAmount, setTransferAmount] = useState(amount.toString());

  // Filter banks based on search query
  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks;
    const query = searchQuery.toLowerCase();
    return banks.filter(
      (bank) =>
        bank.bank_name?.toLowerCase().includes(query) ||
        bank.account_number?.toLowerCase().includes(query)
    );
  }, [banks, searchQuery]);

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

  const handleBankSelect = (bank: PaymentConfig) => {
    setSelectedBank(bank);
    onBankSelect?.(bank);
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

  if (banks.length === 0) {
    return (
      <div className="p-4 bg-muted/50 rounded-xl text-center">
        <p className="text-sm text-muted-foreground">
          Tidak ada rekening bank yang tersedia saat ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Amount */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-center">
        <p className="text-xs text-muted-foreground mb-1">Total Pembayaran</p>
        <p className="text-3xl font-bold text-primary">{formatPrice(amount)}</p>
      </Card>

      {/* Bank Selection */}
      <div>
        <h4 className="font-semibold text-foreground text-sm mb-3">Pilih Bank Tujuan:</h4>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari bank Anda"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Bank Grid */}
        {filteredBanks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredBanks.map((bank) => {
              const bankColor = bankColors[bank.bank_name || ""] || {
                bg: "bg-muted/30",
                text: "text-foreground",
                border: "border-border/50",
              };
              
              return (
                <motion.button
                  key={bank.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBankSelect(bank)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedBank?.id === bank.id
                      ? `border-primary bg-primary/5 shadow-lg ${bankColor.border}`
                      : `border-border/50 bg-card hover:border-primary/30 ${bankColor.border}`
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                        selectedBank?.id === bank.id
                          ? bankColor.bg
                          : "bg-muted/30"
                      }`}
                    >
                      {bankLogos[bank.bank_name || ""] || (
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <p
                        className={`font-semibold text-xs sm:text-sm ${
                          selectedBank?.id === bank.id ? bankColor.text : "text-foreground"
                        }`}
                      >
                        {bank.bank_name}
                      </p>
                    </div>
                    {selectedBank?.id === bank.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-muted/30 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              Bank tidak ditemukan untuk "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Selected Bank Details */}
      {selectedBank && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-card rounded-xl border-2 border-primary/20 space-y-4"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
              {bankLogos[selectedBank.bank_name || ""] || <Building2 className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <p className="font-semibold text-foreground">{selectedBank.bank_name}</p>
              <p className="text-xs text-muted-foreground">Rekening Tujuan</p>
            </div>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Nomor Rekening</p>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <p className="font-mono font-semibold text-foreground text-lg">
                {selectedBank.account_number}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyToClipboard(selectedBank.account_number, "Nomor rekening", "account")
                }
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

          {/* Account Name */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Atas Nama</p>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <p className="font-semibold text-foreground">{selectedBank.account_name}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyToClipboard(selectedBank.account_name, "Nama pemilik", "name")
                }
                className="shrink-0"
              >
                {copiedField === "name" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Instruksi:</strong> Transfer sesuai nominal ke
              rekening di atas. Pastikan nominal transfer tepat sesuai dengan total pembayaran.
            </p>
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
              <Label htmlFor="sender-account" className="text-xs font-medium">
                Nomor Rekening / Kartu Pengirim
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="sender-account"
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={senderAccountNumber}
                  onChange={(e) => setSenderAccountNumber(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Sender Name */}
            <div className="space-y-2">
              <Label htmlFor="sender-name" className="text-xs font-medium">
                Nama Pengirim
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="sender-name"
                  type="text"
                  placeholder="Nama sesuai rekening/kartu"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Transfer Amount */}
            <div className="space-y-2">
              <Label htmlFor="transfer-amount" className="text-xs font-medium">
                Jumlah Transfer
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="transfer-amount"
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
        </motion.div>
      )}
    </div>
  );
}

