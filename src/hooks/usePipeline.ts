import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";

export type Pipeline = Tables<"pipeline">;

export function usePipeline(leadId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pipeline", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline")
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle();
      if (error) throw error;
      return data as Pipeline | null;
    },
    enabled: !!user && !!leadId,
  });
}

export function useUpsertPipeline() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<TablesInsert<"pipeline">, "user_id">) => {
      // Check if pipeline exists
      const { data: existing } = await supabase
        .from("pipeline")
        .select("id")
        .eq("lead_id", data.lead_id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("pipeline")
          .update({ stage: data.stage, follow_up_date: data.follow_up_date, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pipeline")
          .insert({ ...data, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["pipeline", vars.lead_id] }),
  });
}
