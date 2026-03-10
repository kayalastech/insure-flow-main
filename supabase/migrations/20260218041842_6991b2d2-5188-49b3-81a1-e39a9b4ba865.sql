
-- Create application_status enum
CREATE TYPE public.application_status AS ENUM ('Pending', 'Approved', 'Rejected', 'On Hold');

-- Add application_status column to pipeline table
ALTER TABLE public.pipeline ADD COLUMN application_status public.application_status NOT NULL DEFAULT 'Pending';
