import { Star, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

interface ProfileReviewsProps {
  rating: number;
  reviewCount: number;
  reviews?: Review[]; // Optional for now
}

export function ProfileReviews({ rating, reviewCount, reviews = [] }: ProfileReviewsProps) {
  // Mock reviews if none provided
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: "1",
      reviewerName: "Pengguna",
      rating: 5,
      comment: "Orangnya asik banget, ramah dan on time. Recommended!",
      date: "2 hari yang lalu",
    },
    {
      id: "2",
      reviewerName: "Anonim",
      rating: 4,
      comment: "Seru diajak ngobrol, wawasan luas.",
      date: "1 minggu yang lalu",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Ulasan ({reviewCount})</h3>
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-lg">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">/ 5.0</span>
        </div>
      </div>

      <div className="space-y-4">
        {displayReviews.map((review) => (
          <div key={review.id} className="p-4 rounded-xl bg-muted/20 border border-border/30">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={review.avatar} />
                <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">{review.reviewerName}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex text-yellow-500 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-muted/30"}`} 
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {reviewCount > 2 && (
        <button className="text-sm font-medium text-primary hover:underline w-full text-center">
          Lihat semua ulasan
        </button>
      )}
    </div>
  );
}
