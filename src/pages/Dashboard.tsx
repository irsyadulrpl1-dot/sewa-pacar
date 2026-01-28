import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Sparkles } from "lucide-react";

type AppUserRole = "renter" | "companion";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (loading) return;
    const role = (profile?.role ?? null) as AppUserRole | null;
    if (!role) {
      navigate("/choose-role", { replace: true });
      return;
    }
    navigate(role === "companion" ? "/dashboard/companion" : "/dashboard/renter", {
      replace: true,
    });
  }, [loading, profile, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Sparkles className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}


