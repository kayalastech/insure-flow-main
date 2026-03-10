import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUserRole() {
  const { user } = useAuth();

  console.log("[useUserRole] Current user:", user ? user.id : "null/undefined");

  const { data: role, isLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {

      console.log("[useUserRole] Query running for user_id:", user!.id);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .single();

        console.log("[useUserRole] Supabase response → data:", data, "error:", error);
      if (error){
        console.error("[useUserRole] Supabase error:", error);
       throw error;
      }
      return data.role as "admin" | "team_lead" | "agent";
    },
    enabled: !!user,
  });

  console.log("[useUserRole] Final role:", role, "isAdmin:", role === "admin", "isLoading:", isLoading);

  return {
    role: role ?? "agent",
    isAdmin: role === "admin",
    isLoading,
  };
}
