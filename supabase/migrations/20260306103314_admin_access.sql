
-- Admin can view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can update all leads
CREATE POLICY "Admins can update all leads"
ON public.leads FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete all leads
CREATE POLICY "Admins can delete all leads"
ON public.leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also allow admins to view all profiles (to see agent names)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all pipeline entries
CREATE POLICY "Admins can view all pipeline"
ON public.pipeline FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all lead documents
CREATE POLICY "Admins can view all lead documents"
ON public.leads_documents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
