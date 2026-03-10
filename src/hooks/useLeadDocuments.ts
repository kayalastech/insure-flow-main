import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LeadDocument {
  id: string;
  lead_id: string;
  document_name: string;
  document_type: string | null;
  document_url: string;
  insurance_type: string;
  is_mandatory: boolean;
  uploaded_by: string;
  created_at: string;
}

export function useLeadDocuments(leadId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads_documents", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads_documents")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeadDocument[];
    },
    enabled: !!user && !!leadId,
  });
}

export function useSaveLeadDocuments() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      leadId,
      files,
      insuranceType,
    }: {
      leadId: string;
      files: { documentName: string; file: File; isMandatory: boolean }[];
      insuranceType: string;
    }) => {
      const results = [];

      for (const { documentName, file, isMandatory } of files) {
        const filePath = `${leadId}/${Date.now()}_${file.name}`;

        // Delete old file from storage if replacing
        const existingDoc = await supabase
          .from("leads_documents")
          .select("document_url")
          .eq("lead_id", leadId)
          .eq("document_name", documentName)
          .maybeSingle();

        if (existingDoc.data?.document_url) {
          try {
            const oldPath = new URL(existingDoc.data.document_url).pathname.split("/object/public/leads-documents-0001/")[1];
            if (oldPath) {
              await supabase.storage.from("leads-documents-0001").remove([decodeURIComponent(oldPath)]);
            }
          } catch {}
        }

        const { error: uploadError } = await supabase.storage
          .from("leads-documents-0001")
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("leads-documents-0001")
          .getPublicUrl(filePath);

        // Delete existing document with same name for this lead
        await supabase
          .from("leads_documents")
          .delete()
          .eq("lead_id", leadId)
          .eq("document_name", documentName);

        const { error: dbError } = await supabase
          .from("leads_documents")
          .insert({
            lead_id: leadId,
            document_name: documentName,
            document_type: file.type || null,
            document_url: urlData.publicUrl,
            insurance_type: insuranceType,
            is_mandatory: isMandatory,
            uploaded_by: user!.id,
          });
        if (dbError) throw dbError;
        results.push(documentName);
      }

      return results;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["leads_documents", vars.leadId] }),
  });
}
