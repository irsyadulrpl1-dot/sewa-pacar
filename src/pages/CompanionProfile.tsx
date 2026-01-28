import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

// New Components
import { ProfileHeader } from "@/components/companion-profile/ProfileHeader";
import { ProfileActions } from "@/components/companion-profile/ProfileActions";
import { ProfileInfo } from "@/components/companion-profile/ProfileInfo";
import { ServiceDetails } from "@/components/companion-profile/ServiceDetails";
import { ScheduleInfo } from "@/components/companion-profile/ScheduleInfo";
import { ProfileReviews } from "@/components/companion-profile/ProfileReviews";

const CompanionProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { profile: myProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicCompanion, setDynamicCompanion] = useState<{
    id: string;
    name: string;
    age: number;
    city: string;
    rating: number;
    hourlyRate: number;
    image: string;
    bio: string;
    description: string;
    personality: string[];
    activities: string[];
    availability: string;
    packages: { name: string; duration: string; price: number }[];
    is_online?: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        const { data: profileData, error: profileError } = await (supabase as any)
          .from("profiles")
          .select("*")
          .eq("user_id", id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Gagal memuat profil companion");
          setLoading(false);
          return;
        }
        
        if (!profileData) {
          console.log("Profile not found for id:", id);
          toast.error("Profil tidak ditemukan");
          setLoading(false);
          return;
        }
        
        let age = 0;
        if (profileData.date_of_birth) {
          const today = new Date();
          const birth = new Date(profileData.date_of_birth);
          age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
        }
        
        const rating = profileData.is_verified ? 4.5 : 4.0;
        const image = profileData.avatar_url || "/placeholder-avatar.png";
        
        const personality: string[] = Array.isArray(profileData.personality) ? profileData.personality : [];
        const activities: string[] =
          Array.isArray(profileData.activities) ? profileData.activities : Array.isArray(profileData.interests) ? profileData.interests : [];
        const packages: { name: string; duration: string; price: number }[] = Array.isArray(profileData.packages) ? profileData.packages : [];
        const availability: string = profileData.availability || "";
        
        const normalized = {
          id: profileData.user_id || id,
          name: profileData.full_name || profileData.username || "Unknown",
          age,
          city: profileData.city || "",
          rating,
          hourlyRate: (() => {
            const explicit = Number(profileData.hourly_rate);
            if (Number.isFinite(explicit) && explicit > 0) return explicit;
            if (packages && packages.length > 0) {
              const prices = packages
                .map((pkg) => {
                  const duration = parseInt(String(pkg.duration)) || 1;
                  return (Number(pkg.price) || 0) / duration;
                })
                .filter((price) => price > 0);
              if (prices.length > 0) return Math.min(...prices);
            }
            return 0;
          })(),
          image,
          bio: profileData.bio || "",
          description: profileData.bio || "",
          personality,
          activities,
          availability,
          packages,
          is_online: profileData.is_online || false, // Assuming is_online exists or defaulting
        };
        
        setDynamicCompanion(normalized);
      } catch (err) {
        console.error("Error in fetchProfile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <MobileLayout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-xl md:text-2xl font-display text-foreground mb-4">
              Memuat profil...
            </h1>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!dynamicCompanion) {
    return (
      <MobileLayout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-xl md:text-2xl font-display text-foreground mb-4">
              Profil tidak ditemukan 😢
            </h1>
            <Button variant="gradient" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}>
              Lihat Yang Lain
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const active = dynamicCompanion;

  const handleChatClick = () => {
    if (!user) {
      toast.info("Silakan login terlebih dahulu untuk chat");
      navigate("/auth");
      return;
    }
    navigate(`/companion-chat/${active.id}`);
  };

  const handleBookPackage = () => {
    if (!user) {
      toast.info("Silakan login terlebih dahulu untuk memesan");
      navigate("/auth");
      return;
    }
    setIsBookingWizardOpen(true);
  };

  const handleBookingSuccess = () => {
    toast.success("Pemesanan berhasil! Menunggu konfirmasi admin.");
  };

  return (
    <MobileLayout showFooter={false}>
      <main className="pt-4 md:pt-16 pb-32 bg-background min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => {
                const from = (location.state as { from?: string } | null)?.from as string | undefined;
                if (from) {
                  navigate(from);
                } else if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Kembali</span>
            </Button>
          </motion.div>

          {/* Profile Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-12"
          >
            <ProfileHeader
              name={active.name}
              image={active.image}
              rating={active.rating}
              reviewCount={12} // Mock for now or add to fetch
              hourlyRate={active.hourlyRate}
              isOnline={active.is_online}
              city={active.city}
            />
          </motion.section>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
            {/* Left Column - Main Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-10"
            >
              {/* Action Buttons (Mobile only, or placed here for flow) */}
              <div className="lg:hidden">
                <ProfileActions 
                  onChat={handleChatClick} 
                  onBook={handleBookPackage} 
                  isOwnProfile={(myProfile?.role as any) === "companion"}
                />
              </div>

              {/* Info Section */}
              <section>
                <ProfileInfo
                  about={active.description || active.bio}
                  age={active.age}
                  city={active.city}
                  serviceType="Online & Offline" // Derived or static
                  experience="1 Tahun" // Derived or static
                />
              </section>

              {/* Reviews Section */}
              <section>
                <ProfileReviews rating={active.rating} reviewCount={12} />
              </section>
            </motion.div>

            {/* Right Column - Sidebar / Service Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Desktop Actions */}
              <div className="hidden lg:block">
                <ProfileActions 
                  onChat={handleChatClick} 
                  onBook={handleBookPackage}
                  isOwnProfile={(myProfile?.role as any) === "companion"}
                />
              </div>

              <ServiceDetails
                hourlyRate={active.hourlyRate}
                minDuration={2}
                packages={active.packages}
                notes="Harga belum termasuk biaya transportasi/makan jika offline."
              />

              <ScheduleInfo availability={active.availability} />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Booking Wizard */}
      {active && (
        <BookingWizard
          open={isBookingWizardOpen}
          onOpenChange={setIsBookingWizardOpen}
          companion={{
            id: active.id,
            name: active.name,
            image: active.image,
            city: active.city,
            hourlyRate: active.hourlyRate,
            packages: active.packages,
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </MobileLayout>
  );
};

export default CompanionProfile;
