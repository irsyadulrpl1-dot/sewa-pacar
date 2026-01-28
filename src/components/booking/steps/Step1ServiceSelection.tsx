import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, DollarSign, Info } from "lucide-react";
import type { CompanionInfo } from "../BookingWizard";
import type { BookingPackage } from "@/hooks/useBooking";

interface Step1ServiceSelectionProps {
  companion: CompanionInfo;
  selectedPackage: BookingPackage | null;
  onSelect: (pkg: BookingPackage) => void;
}

export function Step1ServiceSelection({
  companion,
  selectedPackage,
  onSelect,
}: Step1ServiceSelectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Default packages if not provided or empty
  const packages: BookingPackage[] = (companion.packages && companion.packages.length > 0) 
    ? companion.packages.map(pkg => ({
        ...pkg,
        duration: pkg.duration || "Durasi fleksibel",
        price: pkg.price || 0,
      }))
    : [
        {
          name: "Coffee Date",
          duration: "2 jam",
          price: (companion.hourlyRate || 150000) * 2,
        },
        {
          name: "Hangout",
          duration: "3 jam",
          price: (companion.hourlyRate || 150000) * 3,
        },
        {
          name: "Full Day",
          duration: "8 jam",
          price: (companion.hourlyRate || 150000) * 8,
        },
      ];

  // Debug log
  console.log("Step1ServiceSelection - Packages:", {
    companionPackages: companion.packages,
    finalPackages: packages,
    hourlyRate: companion.hourlyRate,
  });

  const hourlyRate = companion.hourlyRate || packages[0]?.price || 150000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Pilih Layanan</h2>
        <p className="text-muted-foreground">
          Pilih paket yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      {/* Service Info Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
            <img
              src={companion.image}
              alt={companion.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {companion.name}
            </h3>
            {companion.city && (
              <p className="text-sm text-muted-foreground mb-3">
                📍 {companion.city}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Harga dasar: {formatPrice(hourlyRate)}/jam</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Service Rules */}
      <Card className="p-4 bg-muted/50 border-border">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-foreground">Aturan Layanan:</p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Pembayaran dilakukan sebelum pertemuan</li>
              <li>Pembatalan minimal 24 jam sebelum jadwal</li>
              <li>Durasi dapat disesuaikan di step berikutnya</li>
              <li>Harga final akan dihitung berdasarkan durasi</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Package Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Paket Tersedia</h3>
        {packages && packages.length > 0 ? (
          <div className="grid gap-3">
            {packages.map((pkg, index) => {
              const isSelected = selectedPackage?.name === pkg.name;
              // Ensure duration is always displayed
              const duration = pkg.duration || "Durasi fleksibel";
              return (
                <motion.div
                  key={`${pkg.name}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      console.log("Package selected:", pkg);
                      onSelect(pkg);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {pkg.name}
                          </h4>
                          {isSelected && (
                            <Badge className="bg-primary text-primary-foreground">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Dipilih
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {duration}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(pkg.price || 0)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center border-dashed border-border">
            <p className="text-muted-foreground">
              Tidak ada paket tersedia. Silakan hubungi companion untuk informasi lebih lanjut.
            </p>
          </Card>
        )}
      </div>

      {/* Custom Duration Option */}
      <Card className="p-4 bg-muted/30 border-dashed border-border">
        <p className="text-sm text-muted-foreground text-center">
          💡 Durasi dapat disesuaikan di step berikutnya. Harga akan dihitung per jam.
        </p>
      </Card>
    </div>
  );
}

