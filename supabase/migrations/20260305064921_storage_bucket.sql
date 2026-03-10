-- Create bucket safely
INSERT INTO storage.buckets (id, name, public)
VALUES ('leads-documents-0001', 'leads-documents-0001', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove policies if they already exist (important for migrations)
DROP POLICY IF EXISTS "Authenticated users can upload lead documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view lead documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update lead documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete lead documents" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload lead documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'leads-documents-0001');

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view lead documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'leads-documents-0001');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update lead documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'leads-documents-0001');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete lead documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'leads-documents-0001');

-- Index for faster document lookup
CREATE INDEX IF NOT EXISTS idx_leads_documents_lead_id
ON public.leads_documents (lead_id);