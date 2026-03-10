
-- Add storage policies for the existing leads-documents-0001 bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload lead documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'leads-documents-0001');

-- Allow authenticated users to view/download files
CREATE POLICY "Authenticated users can view lead documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'leads-documents-0001');

-- Allow authenticated users to update/replace files
CREATE POLICY "Authenticated users can update lead documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'leads-documents-0001');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete lead documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'leads-documents-0001');

-- Add index on lead_id for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_leads_documents_lead_id ON public.leads_documents (lead_id);
