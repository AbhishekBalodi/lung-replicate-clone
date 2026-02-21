
-- Fix: contacts table SELECT policy is too permissive (allows any authenticated user)
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.contacts;

CREATE POLICY "Admins can view contacts"
ON public.contacts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
