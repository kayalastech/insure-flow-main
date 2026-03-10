import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface InsuranceType {
  id: string;
  insurance_type_name: string;
  created_at: string;
}

export function useInsuranceTypes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["insurance-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_types")
        .select("*")
        .order("insurance_type_name");
      if (error) throw error;
      return data as InsuranceType[];
    },
    enabled: !!user,
  });
}

export function useCreateInsuranceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("insurance_types")
        .insert({ insurance_type_name: name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurance-types"] }),
  });
}

export function useUpdateInsuranceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("insurance_types")
        .update({ insurance_type_name: name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurance-types"] }),
  });
}

export function useDeleteInsuranceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("insurance_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurance-types"] }),
  });
}
