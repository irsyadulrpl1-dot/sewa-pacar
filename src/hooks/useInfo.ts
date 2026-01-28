import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type InfoCategory = "tips" | "announcement" | "guide" | "system_update";

export interface Info {
  id: string;
  title: string;
  category: InfoCategory;
  summary: string | null;
  content: string;
  is_official: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useInfo(category?: InfoCategory) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const untypedSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );

  const { data: infos, isLoading } = useQuery({
    queryKey: ["info", category],
    queryFn: async () => {
      let query = untypedSupabase.from("info").select("*").order("updated_at", { ascending: false });
      if (category) {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Info[];
    },
  });

  const createInfo = useMutation({
    mutationFn: async (payload: {
      title: string;
      category: InfoCategory;
      summary?: string;
      content: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      const isAdminRes = await supabase.rpc("has_role", { _role: "admin", _user_id: user.id });
      if (isAdminRes.error) throw isAdminRes.error;
      if (!isAdminRes.data) throw new Error("Not authorized");
      const { error } = await untypedSupabase
        .from("info")
        .insert({
          title: payload.title,
          category: payload.category,
          summary: payload.summary || null,
          content: payload.content,
          is_official: true,
          created_by: user.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["info"] });
      toast.success("Info berhasil dibuat");
    },
    onError: (error) => {
      toast.error("Gagal membuat info: " + error.message);
    },
  });

  return { infos, isLoading, createInfo };
}
