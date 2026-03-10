import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Insurer {
  id: string;
  name: string;
  code: string;
  portal_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useInsurers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["insurers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurers")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Insurer[];
    },
    enabled: !!user,
  });
}

export function useCreateInsurer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (insurer: {
      name: string;
      code: string;
      portal_url?: string;
      is_active: boolean;
    }) => {
      const { data, error } = await supabase
        .from("insurers")
        .insert(insurer)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurers"] }),
  });
}

export function useUpdateInsurer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name: string;
      code: string;
      portal_url?: string | null;
      is_active: boolean;
    }) => {
      const { data, error } = await supabase
        .from("insurers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurers"] }),
  });
}

export function useDeleteInsurer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("insurers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurers"] }),
  });
}
