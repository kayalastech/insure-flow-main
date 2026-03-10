
-- Fix leads_documents RLS: drop RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can insert own lead documents" ON public.leads_documents;
DROP POLICY IF EXISTS "Users can view own lead documents" ON public.leads_documents;
DROP POLICY IF EXISTS "Users can update own lead documents" ON public.leads_documents;
DROP POLICY IF EXISTS "Users can delete own lead documents" ON public.leads_documents;

-- Recreate as PERMISSIVE policies (the default)
CREATE POLICY "Users can insert own lead documents"
ON public.leads_documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can view own lead documents"
ON public.leads_documents FOR SELECT
TO authenticated
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own lead documents"
ON public.leads_documents FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own lead documents"
ON public.leads_documents FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by);
