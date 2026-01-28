import { motion } from "framer-motion";
import { CreditCard, Wallet, Banknote, Building2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/hooks/usePayments";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods: {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}[] = [
  {
    id: "bank_transfer",
    name: "Transfer Bank",
    description: "BCA, BRI, Mandiri - Upload bukti transfer",
    icon: <Building2 className="w-5 h-5" />,
    category: "Transfer Bank",
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "E-Wallet GoPay",
    icon: <Smartphone className="w-5 h-5" />,
    category: "E-Money / Dompet Digital",
  },
  {
    id: "dana",
    name: "DANA",
    description: "E-Wallet DANA",
    icon: <Wallet className="w-5 h-5" />,
    category: "E-Money / Dompet Digital",
  },
  {
    id: "ovo",
    name: "OVO",
    description: "E-Wallet OVO",
    icon: <CreditCard className="w-5 h-5" />,
    category: "E-Money / Dompet Digital",
  },
  {
    id: "cod",
    name: "COD",
    description: "Bayar saat bertemu",
    icon: <Banknote className="w-5 h-5" />,
    category: "Tunai",
  },
];

export function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  // Group methods by category
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, typeof paymentMethods>);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Pilih Metode Pembayaran</h3>
        <p className="text-xs text-muted-foreground">Pilih metode pembayaran yang paling nyaman untuk Anda</p>
      </div>
      
      {Object.entries(groupedMethods).map(([category, methods]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              {category}
            </p>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2.5">
            {methods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(method.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                  selected === method.id
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-lg transition-colors",
                    selected === method.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm mb-0.5">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                    selected === method.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {selected === method.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 bg-primary-foreground rounded-full"
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
