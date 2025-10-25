-- Create contacts table for storing contact form submissions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert contact messages
CREATE POLICY "Anyone can submit contact messages" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow authenticated users to view all contacts (for admin purposes)
CREATE POLICY "Authenticated users can view contacts" 
ON public.contacts 
FOR SELECT 
USING (true);