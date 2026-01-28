import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Circle } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  image: string;
  rating: number;
  reviewCount?: number;
  hourlyRate: number;
  isOnline?: boolean;
  city: string;
}

export function ProfileHeader({
  name,
  image,
  rating,
  reviewCount = 0,
  hourlyRate,
  isOnline = false,
  city,
}: ProfileHeaderProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8 items-center">
      {/* Photo */}
      <div className="relative mx-auto md:mx-0">
        <Avatar className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-background shadow-xl">
          <AvatarImage src={image} className="object-cover" />
          <AvatarFallback className="text-4xl">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
          <Badge
            variant="secondary"
            className={`gap-1.5 px-3 py-1 shadow-sm border-white/50 backdrop-blur-sm ${
              isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            <Circle className={`w-2 h-2 fill-current ${isOnline ? "animate-pulse" : ""}`} />
            {isOnline ? "Available" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="text-center md:text-left space-y-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            {name}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{city || "Lokasi tidak diketahui"}</span>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-yellow-700">{rating.toFixed(1)}</span>
            <span className="text-yellow-600/60 text-sm">({reviewCount} reviews)</span>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
            Mulai dari
          </p>
          <div className="flex items-baseline justify-center md:justify-start gap-1">
            <span className="text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(hourlyRate)}
            </span>
            <span className="text-muted-foreground font-medium">/ jam</span>
          </div>
        </div>
      </div>
    </div>
  );
}
