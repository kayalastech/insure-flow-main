
-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'Agent',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Insurers table
CREATE TABLE public.insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  portal_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view insurers" ON public.insurers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert insurers" ON public.insurers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update insurers" ON public.insurers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete insurers" ON public.insurers FOR DELETE TO authenticated USING (true);

-- 3. leads_documents table
CREATE TABLE public.leads_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT,
  document_url TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_documents_lead_id ON public.leads_documents(lead_id);

ALTER TABLE public.leads_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead documents" ON public.leads_documents FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can insert own lead documents" ON public.leads_documents FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update own lead documents" ON public.leads_documents FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete own lead documents" ON public.leads_documents FOR DELETE USING (auth.uid() = uploaded_by);

-- 4. Add insurer_id to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS insurer_id UUID REFERENCES public.insurers(id);
