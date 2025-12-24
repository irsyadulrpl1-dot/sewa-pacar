import { MobileLayout } from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Eye, 
  HelpCircle, 
  FileText,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const settingsGroups = [
  {
    title: "Akun",
    items: [
      { icon: User, label: "Edit Profil", description: "Nama, bio, foto profil", path: "/profile" },
      { icon: Shield, label: "Keamanan", description: "Password, autentikasi 2FA", path: "#" },
      { icon: Lock, label: "Privasi", description: "Siapa yang bisa melihat profilmu", path: "#" },
    ],
  },
  {
    title: "Preferensi",
    items: [
      { icon: Bell, label: "Notifikasi", description: "Push, email, dalam aplikasi", path: "#" },
      { icon: Eye, label: "Tampilan", description: "Tema, bahasa, aksesibilitas", path: "#" },
    ],
  },
  {
    title: "Lainnya",
    items: [
      { icon: HelpCircle, label: "Bantuan", description: "FAQ, hubungi kami", path: "/contact" },
      { icon: FileText, label: "Syarat & Ketentuan", description: "Aturan penggunaan", path: "/rules" },
    ],
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Pengaturan
          </h1>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 mb-6 bg-card border-border/50">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-semibold">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground truncate">
                    {profile?.full_name || "User"}
                  </h2>
                  {profile?.is_verified && (
                    <Badge className="bg-mint/20 text-mint border-mint/30 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  @{profile?.username || "user"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                {group.title}
              </h3>
              <Card className="overflow-hidden bg-card border-border/50">
                {group.items.map((item, itemIndex) => (
                  <button
                    key={item.label}
                    onClick={() => item.path !== "#" && navigate(item.path)}
                    disabled={item.path === "#"}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                      itemIndex !== group.items.length - 1 ? "border-b border-border/50" : ""
                    } ${item.path === "#" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* App Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Versi 1.0.0 • Made with 💕
        </motion.p>
      </div>
    </MobileLayout>
  );
}
