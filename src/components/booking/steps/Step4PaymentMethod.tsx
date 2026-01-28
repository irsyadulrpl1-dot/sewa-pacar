import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Smartphone, Wallet, CreditCard, Banknote, Sparkles } from "lucide-react";
import type { PaymentMethod } from "@/hooks/usePayments";

interface Step4PaymentMethodProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods: {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  recommended?: boolean;
}[] = [
  {
    id: "bank_transfer_integrated",
    name: "Transfer Bank (Terintegrasi)",
    description: "Bayar langsung tanpa buka mobile banking",
    icon: <Building2 className="w-5 h-5" />,
    category: "Transfer Bank",
    recommended: true,
  },
  {
    id: "bank_transfer",
    name: "Transfer Bank (Manual)",
    description: "BCA, BRI, Mandiri - Upload bukti transfer",
    icon: <Building2 className="w-5 h-5" />,
    category: "Transfer Bank",
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "E-Wallet GoPay",
    icon: <Smartphone className="w-5 h-5" />,
    category: "E-Money",
  },
  {
    id: "dana",
    name: "DANA",
    description: "E-Wallet DANA",
    icon: <Wallet className="w-5 h-5" />,
    category: "E-Money",
  },
  {
    id: "ovo",
    name: "OVO",
    description: "E-Wallet OVO",
    icon: <CreditCard className="w-5 h-5" />,
    category: "E-Money",
  },
  {
    id: "cod",
    name: "COD (Cash on Delivery)",
    description: "Bayar saat bertemu",
    icon: <Banknote className="w-5 h-5" />,
    category: "Tunai",
  },
];

export function Step4PaymentMethod({
  selectedMethod,
  onSelect,
}: Step4PaymentMethodProps) {
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, typeof paymentMethods>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Metode Pembayaran</h2>
        <p className="text-muted-foreground">
          Pilih metode pembayaran yang paling nyaman untuk Anda
        </p>
      </div>

      {/* Payment Methods by Category */}
      <div className="space-y-6">
        {Object.entries(groupedMethods).map(([category, methods]) => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
              {category}
            </h3>
            <div className="grid gap-3">
              {methods.map((method, index) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-5 cursor-pointer transition-all relative ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => onSelect(method.id)}
                    >
                      {method.recommended && (
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {method.name}
                            </h4>
                            {isSelected && (
                              <Badge variant="outline" className="border-primary text-primary">
                                Dipilih
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-muted/50 border-border">
        <p className="text-sm text-muted-foreground text-center">
          💡 Semua metode pembayaran aman dan terjamin. Pilih yang paling nyaman untuk Anda.
        </p>
      </Card>
    </div>
  );
}

