import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar } from "lucide-react";

interface ProfileActionsProps {
  onChat: () => void;
  onBook: () => void;
  isOwnProfile: boolean;
}

export function ProfileActions({ onChat, onBook, isOwnProfile }: ProfileActionsProps) {
  return (
    <div className="flex gap-3 w-full md:w-auto">
      <Button
        variant="outline"
        size="lg"
        className="flex-1 md:flex-none h-12 text-base border-border/60 hover:bg-muted/50"
        onClick={onChat}
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        Chat
      </Button>
      <Button
        variant="gradient"
        size="lg"
        className="flex-1 md:flex-none h-12 text-base px-8 shadow-lg hover:shadow-xl transition-all"
        onClick={onBook}
        disabled={isOwnProfile}
      >
        <Calendar className="w-5 h-5 mr-2" />
        {isOwnProfile ? "Preview Mode" : "Booking Sekarang"}
      </Button>
    </div>
  );
}
