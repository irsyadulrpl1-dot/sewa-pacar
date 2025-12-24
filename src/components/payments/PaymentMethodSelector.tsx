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
    id: "cod",
    name: "COD",
    description: "Bayar saat bertemu",
    icon: <Banknote className="w-5 h-5" />,
    category: "Tunai",
  },
  {
    id: "bank_transfer",
    name: "Transfer Bank",
    description: "BCA, BRI, Mandiri",
    icon: <Building2 className="w-5 h-5" />,
    category: "Bank",
  },
  {
    id: "dana",
    name: "DANA",
    description: "E-Wallet DANA",
    icon: <Wallet className="w-5 h-5" />,
    category: "E-Wallet",
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "E-Wallet GoPay",
    icon: <Smartphone className="w-5 h-5" />,
    category: "E-Wallet",
  },
  {
    id: "ovo",
    name: "OVO",
    description: "E-Wallet OVO",
    icon: <CreditCard className="w-5 h-5" />,
    category: "E-Wallet",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    description: "E-Wallet ShopeePay",
    icon: <Wallet className="w-5 h-5" />,
    category: "E-Wallet",
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
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Pilih Metode Pembayaran</h3>
      
      {Object.entries(groupedMethods).map(([category, methods]) => (
        <div key={category} className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{category}</p>
          <div className="grid gap-2">
            {methods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(method.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  selected === method.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    selected === method.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all",
                    selected === method.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {selected === method.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </motion.div>
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
