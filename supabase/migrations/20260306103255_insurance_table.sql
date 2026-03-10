
-- Create insurance_types table
CREATE TABLE public.insurance_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_type_name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_types ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read
CREATE POLICY "Authenticated users can view insurance types"
ON public.insurance_types FOR SELECT TO authenticated
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert insurance types"
ON public.insurance_types FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update insurance types"
ON public.insurance_types FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete insurance types"
ON public.insurance_types FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed with existing enum values
INSERT INTO public.insurance_types (insurance_type_name) VALUES
  ('Health'), ('Life'), ('General'), ('Vehicle');

-- Change leads.insurance_type from enum to text so it can accept dynamic values
ALTER TABLE public.leads
  ALTER COLUMN insurance_type DROP DEFAULT,
  ALTER COLUMN insurance_type TYPE text USING insurance_type::text,
  ALTER COLUMN insurance_type SET DEFAULT 'Health';
