
-- 1. Fix profiles: remove public SELECT, keep owner + admin policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 2. Notifications: let clients see their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = client_id);

-- 3. Notifications: explicitly block non-admin inserts
CREATE POLICY "Only admins can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. User roles: explicit deny INSERT for non-admins
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. User roles: explicit deny DELETE for non-admins
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
