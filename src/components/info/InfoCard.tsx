import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info as InfoIcon, Megaphone, Book, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { Info } from "@/hooks/useInfo";

function categoryIcon(category: Info["category"]) {
  switch (category) {
    case "tips":
      return InfoIcon;
    case "announcement":
      return Megaphone;
    case "guide":
      return Book;
    case "system_update":
      return RefreshCw;
    default:
      return InfoIcon;
  }
}

function categoryLabel(category: Info["category"]) {
  switch (category) {
    case "tips":
      return "Tips";
    case "announcement":
      return "Pengumuman";
    case "guide":
      return "Panduan";
    case "system_update":
      return "Update Sistem";
    default:
      return category;
  }
}

export function InfoCard({ info }: { info: Info }) {
  const Icon = categoryIcon(info.category);

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">{info.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{categoryLabel(info.category)}</Badge>
          {info.is_official && <Badge>Official Info</Badge>}
        </div>
        <CardDescription>
          Diperbarui {formatDistanceToNow(new Date(info.updated_at), { locale: id })} lalu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {info.summary && <p className="text-sm text-muted-foreground">{info.summary}</p>}
        <div className="text-sm leading-relaxed text-foreground">
          <p className="line-clamp-6">{info.content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
