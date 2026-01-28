import { motion } from "framer-motion";
import { Star, MessageCircle, Verified, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface Companion {
  id: string;
  user_id?: string;
  name?: string;
  full_name?: string;
  age?: number;
  city?: string | null;
  rating: number;
  hourlyRate?: number;
  hourly_rate?: number;
  image?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  activities?: string[];
}

interface CompanionCardProps {
  companion: Companion;
  index?: number;
  badge?: "popular" | "new" | "verified";
}

export function CompanionCard({ companion, index = 0, badge }: CompanionCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatStatus, setChatStatus] = useState<"enabled" | "disabled" | "readonly">("disabled");
  const [checking, setChecking] = useState(false);

  // Normalize companion data
  const companionName = companion.name || companion.full_name || "Unknown";
  const companionImage = companion.image || companion.avatar_url || "/placeholder-avatar.png";
  const companionAge = companion.age || 0;
  const companionCity = companion.city || "Unknown";
  const companionRating = companion.rating || 0;
  const companionHourlyRate = companion.hourlyRate || companion.hourly_rate || 0;
  const companionBio = companion.bio || "";
  const companionActivities = companion.activities || [];

  const handleProfileClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    // Use user_id if available, otherwise fallback to id
    const companionId = companion.user_id || companion.id;
    if (chatStatus === "disabled") {
      toast.error("Chat hanya dapat digunakan setelah Anda melakukan booking dan pembayaran.");
      return;
    }
    if (chatStatus === "readonly") {
      toast.info("Sesi chat telah berakhir. Chat bersifat read-only.");
    }
    navigate(`/chat/${companionId}`);
  };

  const getBadge = () => {
    if (badge === "popular") {
      return (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-pink to-coral text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <Sparkles size={12} />
          Populer
        </div>
      );
    }
    if (badge === "new") {
      return (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-mint to-sky text-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          ✨ Baru
        </div>
      );
    }
    if (badge === "verified") {
      return (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-lavender to-pink text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <Verified size={12} />
          Verified
        </div>
      );
    }
    return null;
  };

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
  }, [user?.id, companion.user_id, companion.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative bg-card rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card-hover transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden" onClick={handleProfileClick}>
        <img
          src={companionImage}
          alt={companionName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-avatar.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
        
        {/* Badge */}
        {getBadge()}
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 bg-card/90 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
          <Star size={12} className="text-pink fill-pink md:w-3.5 md:h-3.5" />
          <span className="text-xs md:text-sm font-semibold text-foreground">{companionRating.toFixed(1)}</span>
        </div>
        {!user && (
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge className="bg-primary text-primary-foreground border-0">Login Required</Badge>
            <Badge variant="outline" className="bg-background/70 backdrop-blur-sm">Preview</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
        <div className="space-y-1.5 md:space-y-2">
          {/* Name & Age */}
          <h3 className="text-sm md:text-xl font-display font-bold text-primary-foreground flex items-center gap-1 md:gap-2 leading-tight">
            <span className="truncate">{companionName}</span>
            {companionAge > 0 && <span className="flex-shrink-0">{companionAge}</span>}
            <Verified size={12} className="text-sky flex-shrink-0 md:w-4 md:h-4" />
          </h3>
          
          {/* City */}
          {companionCity && companionCity !== "Unknown" && (
            <p className="text-primary-foreground/80 text-xs md:text-sm">
              📍 {companionCity}
            </p>
          )}
          
          {/* Price */}
          {companionHourlyRate > 0 && (
            <div className="flex items-baseline gap-0.5 md:gap-1">
              <span className="text-sm md:text-lg font-bold text-primary-foreground">
                Rp{companionHourlyRate.toLocaleString('id-ID')}
              </span>
              <span className="text-primary-foreground/70 text-[10px] md:text-sm">/jam</span>
            </div>
          )}
          
          {/* Buttons - hidden on small mobile, shown on larger screens */}
          <div className="hidden md:flex gap-2 pt-1">
            <Button variant="gradient" size="sm" className="shadow-lg" onClick={handleProfileClick}>
              Lihat Profil
            </Button>
            <Button 
              variant="whatsapp" 
              size="sm" 
              className="shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleChatClick}
              disabled={checking || chatStatus === "disabled"}
            >
              <MessageCircle size={14} />
              Chat
            </Button>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleProfileClick}
        className="absolute inset-0 z-10 md:hidden"
        aria-label={`Lihat profil ${companionName}`}
      />
    </motion.div>
  );
}
