import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, Heart, MessageCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Companion } from "@/hooks/useCompanions";
import { BookingWizard, CompanionInfo } from "@/components/booking/BookingWizard";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CompanionExploreCardProps {
  companion: Companion;
}

export function CompanionExploreCard({ companion }: CompanionExploreCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [chatStatus, setChatStatus] = useState<"enabled" | "disabled" | "readonly">("disabled");
  const [checking, setChecking] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleChatClick = () => {
    if (!user) {
      toast.info("Silakan login untuk membuka chat");
      const targetId = companion.user_id || companion.id;
      setTimeout(() => {
        navigate(`/auth?redirect=${encodeURIComponent(`/chat/${targetId}`)}`);
      }, 1200);
      return;
    }
    if (chatStatus === "disabled") {
      toast.error("Chat hanya dapat digunakan setelah Anda melakukan booking dan pembayaran.");
      return;
    }
    if (chatStatus === "readonly") {
      toast.info("Sesi chat telah berakhir. Chat bersifat read-only.");
    }
    navigate(`/chat/${companion.user_id || companion.id}`);
  };

  const handleCardClick = () => {
    const targetId = companion.user_id || companion.id;
    if (!user) {
      toast.info("Silakan login untuk melihat profil lengkap");
      setTimeout(() => {
        navigate(`/auth?redirect=${encodeURIComponent(`/companion/${targetId}`)}`);
      }, 1200);
      return;
    }
    navigate(`/companion/${targetId}`);
  };

  const handleBookClick = () => {
    if (!user) {
      toast.info("Silakan login untuk melakukan pemesanan");
      const targetId = companion.user_id || companion.id;
      setTimeout(() => {
        navigate(`/auth?redirect=${encodeURIComponent(`/companion/${targetId}`)}`);
      }, 1200);
      return;
    }
    setShowBookingWizard(true);
  };

  const companionInfo: CompanionInfo = {
    id: companion.user_id || companion.id,
    name: companion.name || companion.full_name || "Unknown",
    image: companion.avatar_url || companion.image || "/placeholder-avatar.png",
    city: companion.city || undefined,
    hourlyRate: companion.hourly_rate || companion.hourlyRate || 0,
    packages: companion.packages || undefined,
  };

  // Check availability based on companion data
  const isAvailable = companion.status !== "busy" && companion.status !== "offline";

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) {
        setChatStatus("disabled");
        return;
      }
      const companionId = companion.user_id || companion.id;
      if (!companionId) {
        setChatStatus("disabled");
        return;
      }
      setChecking(true);
      try {
        const { data: bookings, error } = await (supabase as any)
          .from("bookings")
          .select("id, status, booking_date, booking_time, duration_hours, payment_id, created_at, user_id, companion_id")
          .or(`and(user_id.eq.${user.id},companion_id.eq.${companionId}),and(user_id.eq.${companionId},companion_id.eq.${user.id})`)
          .order("created_at", { ascending: false });

        if (error || !bookings || bookings.length === 0) {
          setChatStatus("disabled");
          return;
        }
        const latest = bookings[0];
        if (latest.status === "cancelled") {
          setChatStatus("disabled");
          return;
        }
        const isPaidOrConfirmed = latest.status === "confirmed" || latest.status === "approved" || latest.payment_id !== null;
        const [hh = "00", mm = "00"] = (latest.booking_time || "00:00").split(":");
        const startDate = new Date(latest.booking_date);
        startDate.setHours(Number(hh), Number(mm), 0, 0);
        const endDate = new Date(startDate.getTime() + (Number(latest.duration_hours) || 0) * 3600 * 1000);
        const now = new Date();

        if (latest.status === "completed" || now > endDate) {
          setChatStatus("readonly");
          return;
        }
        if (!isPaidOrConfirmed || now < startDate) {
          setChatStatus("disabled");
          return;
        }
        setChatStatus("enabled");
      } catch {
        setChatStatus("disabled");
      } finally {
        setChecking(false);
      }
    };
    checkEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, companion.user_id || companion.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
        {/* Image Section */}
        <div 
          className="relative cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={companion.avatar_url || companion.image || "/placeholder-avatar.png"}
              alt={companion.name || companion.full_name || "Companion"}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-avatar.png";
              }}
            />
          </div>
          
          {/* Rating Badge */}
          {companion.rating > 0 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {companion.rating.toFixed(1)}
              </Badge>
            </div>
          )}
          
          {/* Verified Badge */}
          {companion.is_verified && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm border-0 gap-1">
                <span className="text-xs">✓</span>
              </Badge>
            </div>
          )}
          {!user && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              <Badge className="bg-primary text-primary-foreground border-0">Login Required</Badge>
              <Badge variant="outline" className="bg-background/70 backdrop-blur-sm">Preview</Badge>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Name & Basic Info */}
          <div>
            <h3 
              className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={handleCardClick}
            >
              {companion.name || companion.full_name || "Unknown"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              {companion.city && (
                <>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {companion.city}
                  </span>
                  {(companion.age || companion.availability) && <span>•</span>}
                </>
              )}
              {companion.age && (
                <>
                  <span>{companion.age} tahun</span>
                  {companion.availability && <span>•</span>}
                </>
              )}
              {companion.availability && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {companion.availability}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          {(companion.hourly_rate || companion.hourlyRate) > 0 && (
            <div className="text-primary font-bold text-lg">
              {formatPrice(companion.hourly_rate || companion.hourlyRate || 0)}/jam
            </div>
          )}

          {/* Bio */}
          {(companion.description || companion.bio) && (
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Tentang Aku</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {companion.description || companion.bio}
              </p>
            </div>
          )}

          {/* Personality Tags */}
          {companion.personality && companion.personality.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-2">Kepribadian</h4>
              <div className="flex flex-wrap gap-2">
                {companion.personality.slice(0, 4).map((trait) => (
                  <Badge
                    key={trait}
                    variant="outline"
                    className="rounded-full text-xs font-medium border-border bg-background/50"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Status Badge removed */}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 mt-auto">
            <Button
              onClick={handleBookClick}
              disabled={!isAvailable}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="h-4 w-4" />
              Pesan
            </Button>
            <Button
              onClick={handleChatClick}
              variant="outline"
              size="icon"
              className="shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={checking || chatStatus === "disabled"}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Booking Wizard */}
      <BookingWizard
        open={showBookingWizard}
        onOpenChange={setShowBookingWizard}
        companion={companionInfo}
        onSuccess={() => {
          setShowBookingWizard(false);
        }}
      />
    </motion.div>
  );
}
