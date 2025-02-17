-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own rating links" ON rating_links;

-- Create policies for rating links
CREATE POLICY "Users can manage own rating links" ON rating_links
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow public access to rating links for verification
CREATE POLICY "Public can verify rating links" ON rating_links
  FOR SELECT
  TO anon
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );