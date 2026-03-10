import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PipelineWithLead = {
  id: string;
  lead_id: string;
  stage: string;
  follow_up_date: string | null;
  application_status: string;
  updated_at: string;
  user_id: string;
  leads: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    insurance_type: string;
    status: string;
    location: string | null;
    remarks: string | null;
    created_at: string;
  };
};

export function usePipelineLeads(stage?: "Follow Up" | "Partial Docs Submitted" | "Submitted") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pipeline-leads", stage],
    queryFn: async () => {
      let query = supabase
        .from("pipeline")
        .select("*, leads(*)")
        .order("updated_at", { ascending: false });

      if (stage) {
        query = query.eq("stage", stage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PipelineWithLead[];
    },
    enabled: !!user,
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ pipelineId, status }: { pipelineId: string; status: string }) => {
      const { error } = await supabase
        .from("pipeline")
        .update({ application_status: status as any, updated_at: new Date().toISOString() })
        .eq("id", pipelineId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline-leads"] });
      qc.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });
}
