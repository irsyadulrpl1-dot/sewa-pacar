import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, UserCheck, Briefcase } from "lucide-react";

type AppUserRole = "renter" | "companion";

export default function ChooseRole() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, refetch } = useProfile();
  const [selected, setSelected] = useState<AppUserRole | null>(null);
  const [saving, setSaving] = useState(false);

  const currentRole = useMemo(() => (profile?.role ?? null) as AppUserRole | null, [profile]);

  // If role already set, just go to dashboard
  useEffect(() => {
    if (!loading && user && currentRole) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, currentRole, navigate]);

  const saveRole = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!selected) {
      toast.error("Pilih peran terlebih dahulu");
      return;
    }

    setSaving(true);
    try {
      // Prefer the guarded RPC (role can only be set once).
      // If RPC isn't deployed yet (404), fallback to updating profiles.role directly.
      let rpcError: any = null;
      try {
        const { error } = await supabase.rpc("set_profile_role" as any, {
          new_role: selected,
        });
        rpcError = error;
      } catch (e: any) {
        rpcError = e;
      }

      if (rpcError) {
        const msg = String(rpcError?.message || "").toLowerCase();
        const status = (rpcError as any)?.status;

        // 404 from /rpc means the function isn't available in this instance yet
        const isRpcMissing =
          status === 404 ||
          msg.includes("404") ||
          msg.includes("not found") ||
          msg.includes("could not find the function") ||
          msg.includes("could not find function");

        // If role already set, we can safely proceed to dashboard
        if (msg.includes("already set") || msg.includes("role already set")) {
          navigate("/dashboard", { replace: true });
          return;
        }

        if (isRpcMissing) {
          const { error: updateError } = await (supabase as any)
            .from("profiles")
            .update({ role: selected })
            .eq("user_id", user.id)
            .is("role", null);

          if (updateError) throw updateError;
        } else {
          throw rpcError;
        }
      }

      await refetch();
      toast.success("Peran berhasil disimpan");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Failed to set role:", err);
      toast.error(err?.message || "Gagal menyimpan peran");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Pilih Peran Kamu
          </h1>
          <p className="text-muted-foreground mt-2">
            Peran ini <span className="font-semibold">disimpan permanen</span> dan menentukan fitur yang bisa kamu akses.
          </p>
        </div>

        <div className="space-y-4">
          <Card
            className={`p-5 border-border/50 cursor-pointer transition-all ${
              selected === "renter" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/40"
            }`}
            onClick={() => setSelected("renter")}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">Penyewa</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Cari teman, follow, booking, dan chat setelah booking.
                </div>
              </div>
            </div>
          </Card>

          <Card
            className={`p-5 border-border/50 cursor-pointer transition-all ${
              selected === "companion" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/40"
            }`}
            onClick={() => setSelected("companion")}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">Teman yang Disewa</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Lengkapi profil layanan (harga, jadwal), terima booking, dan chat dari booking.
                </div>
              </div>
            </div>
          </Card>

          <Button
            variant="gradient"
            size="lg"
            className="w-full rounded-xl h-12 mt-4"
            disabled={saving || !selected}
            onClick={saveRole}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              "Simpan & Lanjutkan"
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}


