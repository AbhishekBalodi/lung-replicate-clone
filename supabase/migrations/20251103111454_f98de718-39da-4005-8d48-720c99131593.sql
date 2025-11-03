-- Create patients table to track patient information
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  date_of_birth date,
  address text,
  is_new_patient boolean DEFAULT true,
  first_visit_date timestamp with time zone DEFAULT now(),
  last_visit_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create patient visits table
CREATE TABLE IF NOT EXISTS public.patient_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  visit_date timestamp with time zone DEFAULT now(),
  symptoms text,
  diagnosis text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create medicines catalog table
CREATE TABLE IF NOT EXISTS public.medicines_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  form text,
  strength text,
  default_frequency text,
  duration text,
  route text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create prescribed medicines table
CREATE TABLE IF NOT EXISTS public.prescribed_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES public.patient_visits(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES public.medicines_catalog(id) ON DELETE SET NULL,
  medicine_name text NOT NULL,
  dosage text,
  frequency text,
  duration text,
  instructions text,
  prescribed_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescribed_medicines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Admins can manage patients"
ON public.patients FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for patient_visits
CREATE POLICY "Admins can manage visits"
ON public.patient_visits FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medicines_catalog
CREATE POLICY "Admins can manage medicines catalog"
ON public.medicines_catalog FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for prescribed_medicines
CREATE POLICY "Admins can manage prescribed medicines"
ON public.prescribed_medicines FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster patient searches
CREATE INDEX idx_patients_name ON public.patients(full_name);
CREATE INDEX idx_patients_phone ON public.patients(phone);
CREATE INDEX idx_patient_visits_patient_id ON public.patient_visits(patient_id);
CREATE INDEX idx_prescribed_medicines_patient_id ON public.prescribed_medicines(patient_id);