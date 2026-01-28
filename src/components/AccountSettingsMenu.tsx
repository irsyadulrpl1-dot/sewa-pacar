import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, UserPlus, Users, LogOut, ChevronRight, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface AccountSettingsMenuProps {
  avatarUrl?: string | null;
  fullName?: string;
  username?: string;
}

export function AccountSettingsMenu({ avatarUrl, fullName, username }: AccountSettingsMenuProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Sampai jumpa! 👋",
      description: "Kamu sudah keluar dari akun",
    });
  };

  const handleAddAccount = () => {
    toast({
      title: "Tambah Akun",
      description: "Fitur multi-akun akan segera hadir!",
    });
    setIsDrawerOpen(false);
  };

  const handleSwitchAccount = () => {
    toast({
      title: "Ganti Akun",
      description: "Fitur ganti akun akan segera hadir!",
    });
    setIsDrawerOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsDrawerOpen(false);
  };

  const handleBookingsHistory = () => {
    navigate("/bookings");
    setIsDrawerOpen(false);
  };

  const menuItems = [
    {
      icon: Calendar,
      label: "Riwayat Pemesanan",
      description: "Lihat semua pemesanan",
      onClick: handleBookingsHistory,
    },
    {
      icon: UserPlus,
      label: "Tambah Akun",
      description: "Login dengan akun lain",
      onClick: handleAddAccount,
    },
    {
      icon: Users,
      label: "Ganti Akun",
      description: "Beralih ke akun tersimpan",
      onClick: handleSwitchAccount,
    },
    {
      icon: Settings,
      label: "Pengaturan Akun",
      description: "Profil, keamanan, privasi",
      onClick: handleSettings,
    },
  ];

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-background border-border">
            <DrawerHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-lg font-bold">Pengaturan</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
              
              {/* Current Account */}
              <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-muted/50">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                    {fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{fullName || "User"}</p>
                  <p className="text-sm text-muted-foreground truncate">@{username || "user"}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-mint" title="Online" />
              </div>
            </DrawerHeader>

            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.button>
              ))}

              {/* Logout Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsDrawerOpen(false);
                  setShowLogoutDialog(true);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/10 transition-colors text-left mt-4"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-destructive">Keluar</p>
                  <p className="text-sm text-muted-foreground">Logout dari akun ini</p>
                </div>
              </motion.button>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
              <AlertDialogDescription>
                Kamu akan keluar dari akun ini. Kamu bisa login kembali kapan saja.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Desktop: Dropdown Menu
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 p-2 rounded-xl bg-background border-border shadow-xl"
        >
          {/* Current Account */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                {fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{fullName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">@{username || "user"}</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-mint" title="Online" />
          </div>

          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="my-2" />

          {/* Logout */}
          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Keluar</p>
              <p className="text-xs text-muted-foreground">Logout dari akun ini</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu akan keluar dari akun ini. Kamu bisa login kembali kapan saja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
