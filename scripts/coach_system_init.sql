-- 1. PROFILES TABLE (Foundation)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at timestamptz,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  role text DEFAULT 'client', -- 'admin', 'trainer', 'client'
  membership_status text DEFAULT 'Free',
  boxing_index_results jsonb
);

-- 2. RLS FOR PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- This ensures every new user gets a row in 'profiles'
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'client');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. COACH-CLIENT RELATIONSHIPS
CREATE TABLE IF NOT EXISTS relationships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES auth.users(id) NOT NULL,
    client_id uuid REFERENCES auth.users(id) NOT NULL,
    status text DEFAULT 'active', -- 'active', 'pending', 'archived'
    created_at timestamptz DEFAULT now(),
    UNIQUE(coach_id, client_id)
);

ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can view own relationships" ON relationships
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Client can view own relationships" ON relationships
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admin manages relationships" ON relationships
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );


-- 5. MESSAGES (Chat)
CREATE TABLE IF NOT EXISTS messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) NOT NULL,
    receiver_id uuid REFERENCES auth.users(id) NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Receiver can mark as read" ON messages
    FOR UPDATE USING (auth.uid() = receiver_id);


-- 6. NEWS TABLE (For Admin)
CREATE TABLE IF NOT EXISTS news (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text,
    content text,
    image_url text,
    category text DEFAULT 'NEWS',
    published_at timestamptz DEFAULT now(),
    author text
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read news" ON news FOR SELECT USING (true);
CREATE POLICY "Admins can manage news" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
