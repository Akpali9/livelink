-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------
-- DROP ALL EXISTING TABLES (in correct order to avoid dependency issues)
-------------------------------------------------------------------
DROP TABLE IF EXISTS campaign_streams CASCADE;
DROP TABLE IF EXISTS campaign_payout_cycles CASCADE;
DROP TABLE IF EXISTS campaign_promo_codes CASCADE;
DROP TABLE IF EXISTS campaign_creators CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS saved_campaigns CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS creator_analytics CASCADE;
DROP TABLE IF EXISTS creator_applications CASCADE;
DROP TABLE IF EXISTS creators CASCADE;
DROP TABLE IF EXISTS creator_profiles CASCADE;
DROP TABLE IF EXISTS business_applications CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;
DROP TABLE IF EXISTS business_campaigns CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS social_connections CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-------------------------------------------------------------------
-- PROFILES TABLE (Base user profile)
-------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator', 'business', 'admin')),
  is_live BOOLEAN DEFAULT false,
  stream_key TEXT UNIQUE,
  
  -- Creator earnings
  total_earned DECIMAL(10, 2) DEFAULT 0,
  pending DECIMAL(10, 2) DEFAULT 0,
  paid_out DECIMAL(10, 2) DEFAULT 0,
  
  -- Business fields
  business_name TEXT,
  business_type TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- SOCIAL CONNECTIONS TABLE
-------------------------------------------------------------------
CREATE TABLE social_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-------------------------------------------------------------------
-- BUSINESS PROFILES TABLE
-------------------------------------------------------------------
CREATE TABLE business_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Personal Info
  full_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  phone_country_code TEXT DEFAULT '+44',
  
  -- Business Info
  business_name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN ('Sole Trader', 'Limited Company', 'Partnership', 'Other / Not Registered')),
  industry TEXT NOT NULL,
  description TEXT,
  website TEXT,
  operating_time TEXT,
  country TEXT NOT NULL,
  city TEXT,
  postcode TEXT,
  
  -- Social Media
  socials JSONB DEFAULT '[]'::jsonb,
  
  -- Goals & Targeting
  goals TEXT[] DEFAULT '{}',
  campaign_type TEXT,
  budget TEXT,
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 65,
  gender TEXT[] DEFAULT '{}',
  target_location TEXT,
  
  -- Verification
  referral_code TEXT,
  id_verified BOOLEAN DEFAULT false,
  id_document_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- BUSINESS APPLICATIONS TABLE
-------------------------------------------------------------------
CREATE TABLE business_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- BUSINESSES TABLE (Legacy/Simplified)
-------------------------------------------------------------------
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- BUSINESS CAMPAIGNS TABLE
-------------------------------------------------------------------
CREATE TABLE business_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  logo TEXT,
  partnership_type TEXT CHECK (partnership_type IN ('Pay + Code', 'Paying', 'Code Only', 'Open to Offers')) NOT NULL,
  pay_rate TEXT,
  min_viewers INT NOT NULL DEFAULT 0,
  location TEXT,
  description TEXT,
  niche_tags TEXT[],
  response_rate TEXT,
  closing_date DATE,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  budget_range TEXT,
  about TEXT,
  type TEXT,
  status TEXT DEFAULT 'PENDING REVIEW' CHECK (status IN ('PENDING REVIEW', 'ACTIVE', 'OPEN', 'COMPLETED')),
  streams_total INTEGER DEFAULT 0,
  streams_completed INTEGER DEFAULT 0,
  creators_target INTEGER DEFAULT 1,
  image TEXT,
  is_accepting BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CAMPAIGNS TABLE (Alternative)
-------------------------------------------------------------------
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING REVIEW' CHECK (status IN ('PENDING REVIEW', 'ACTIVE', 'OPEN', 'COMPLETED')),
  price TEXT,
  streams_total INTEGER DEFAULT 0,
  streams_completed INTEGER DEFAULT 0,
  creators_target INTEGER DEFAULT 1,
  image TEXT,
  is_accepting BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CREATOR PROFILES TABLE
-------------------------------------------------------------------
CREATE TABLE creator_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Personal Info
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  phone_country_code TEXT DEFAULT '+44',
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Streaming Platforms
  platforms JSONB DEFAULT '[]'::jsonb,
  
  -- Streaming Habits
  frequency TEXT,
  duration TEXT,
  days TEXT[] DEFAULT '{}',
  time_of_day TEXT,
  avg_concurrent INTEGER DEFAULT 0,
  avg_peak INTEGER DEFAULT 0,
  avg_weekly INTEGER DEFAULT 0,
  categories TEXT[] DEFAULT '{}',
  audience_bio TEXT,
  
  -- Verification
  referral_code TEXT,
  verification_document_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CREATORS TABLE (Now using UUID)
-------------------------------------------------------------------
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  username TEXT UNIQUE,
  avatar TEXT,
  verified BOOLEAN DEFAULT false,
  location TEXT,
  platforms JSONB DEFAULT '[]'::jsonb,
  niches TEXT[],
  bio TEXT,
  availability TEXT,
  stats JSONB DEFAULT '{}'::jsonb,
  packages JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  avg_viewers INTEGER,
  price INTEGER,
  country TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CREATOR APPLICATIONS TABLE
-------------------------------------------------------------------
CREATE TABLE creator_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CREATOR ANALYTICS TABLE
-------------------------------------------------------------------
CREATE TABLE creator_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  avg_concurrent INTEGER NOT NULL,
  avg_peak INTEGER NOT NULL,
  total_views INTEGER NOT NULL,
  total_streams INTEGER NOT NULL,
  total_hours INTEGER NOT NULL,
  screenshot_url TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(creator_id, month)
);

-------------------------------------------------------------------
-- CAMPAIGN CREATORS (Junction Table) - Now using UUID
-------------------------------------------------------------------
CREATE TABLE campaign_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'NOT STARTED' CHECK (status IN ('NOT STARTED', 'IN PROGRESS', 'COMPLETED', 'CANCELLED')),
  streams_completed INTEGER DEFAULT 0,
  streams_required INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CAMPAIGN STREAMS TABLE
-------------------------------------------------------------------
CREATE TABLE campaign_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_creator_id UUID REFERENCES campaign_creators(id) ON DELETE CASCADE,
  stream_number INTEGER,
  status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'COMPLETED', 'MISSED', 'CANCELLED')),
  stream_date DATE,
  duration TEXT,
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CAMPAIGN PROMO CODES TABLE
-------------------------------------------------------------------
CREATE TABLE campaign_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CAMPAIGN PAYOUT CYCLES TABLE
-------------------------------------------------------------------
CREATE TABLE campaign_payout_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_creator_id UUID REFERENCES campaign_creators(id) ON DELETE CASCADE,
  cycle_number INTEGER,
  stream_range TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'PROCESSING', 'PAID', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- OFFERS TABLE - Now using UUID
-------------------------------------------------------------------
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  streams INTEGER,
  rate NUMERIC,
  type TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- CONVERSATIONS TABLE
-------------------------------------------------------------------
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  campaign TEXT,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------
-- MESSAGES TABLE
-------------------------------------------------------------------
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('business', 'creator')),
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seen BOOLEAN DEFAULT false
);

-------------------------------------------------------------------
-- SAVED CAMPAIGNS TABLE
-------------------------------------------------------------------
CREATE TABLE saved_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES business_campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, campaign_id)
);

-------------------------------------------------------------------
-- APPLICATIONS TABLE
-------------------------------------------------------------------
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES business_campaigns(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, campaign_id)
);

-------------------------------------------------------------------
-- CREATE INDEXES
-------------------------------------------------------------------
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_social_connections_user ON social_connections(user_id);

CREATE INDEX idx_business_profiles_user ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON business_profiles(status);
CREATE INDEX idx_business_applications_business ON business_applications(business_id);

CREATE INDEX idx_creator_profiles_user ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_status ON creator_profiles(status);
CREATE INDEX idx_creator_applications_creator ON creator_applications(creator_id);
CREATE INDEX idx_creator_analytics_creator_month ON creator_analytics(creator_id, month);

CREATE INDEX idx_businesses_user ON businesses(user_id);
CREATE INDEX idx_campaigns_business ON campaigns(business_id);
CREATE INDEX idx_business_campaigns_business ON business_campaigns(business_id);
CREATE INDEX idx_creators_user ON creators(user_id);
CREATE INDEX idx_creators_username ON creators(username);
CREATE INDEX idx_campaign_creators_campaign ON campaign_creators(campaign_id);
CREATE INDEX idx_campaign_creators_creator ON campaign_creators(creator_id);
CREATE INDEX idx_campaign_creators_status ON campaign_creators(status);
CREATE INDEX idx_campaign_streams_campaign_creator ON campaign_streams(campaign_creator_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_offers_creator ON offers(creator_id);
CREATE INDEX idx_saved_campaigns_user ON saved_campaigns(user_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_campaign ON applications(campaign_id);

-------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY
-------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_payout_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------
-- CREATE RLS POLICIES
-------------------------------------------------------------------

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Social connections policies
DROP POLICY IF EXISTS "Users can view their own social connections" ON social_connections;
CREATE POLICY "Users can view their own social connections" 
  ON social_connections FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own social connections" ON social_connections;
CREATE POLICY "Users can manage their own social connections" 
  ON social_connections FOR ALL USING (auth.uid() = user_id);

-- Business profiles policies
DROP POLICY IF EXISTS "Users can view own business profile" ON business_profiles;
CREATE POLICY "Users can view own business profile" 
  ON business_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own business profile" ON business_profiles;
CREATE POLICY "Users can insert own business profile" 
  ON business_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own business profile" ON business_profiles;
CREATE POLICY "Users can update own business profile" 
  ON business_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Business applications policies
DROP POLICY IF EXISTS "Users can view own applications" ON business_applications;
CREATE POLICY "Users can view own applications" 
  ON business_applications FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE business_profiles.id = business_applications.business_id 
      AND business_profiles.user_id = auth.uid()
    )
  );

-- Businesses policies
DROP POLICY IF EXISTS "Users can manage their own business profile" ON businesses;
CREATE POLICY "Users can manage their own business profile"
  ON businesses FOR ALL USING (auth.uid() = user_id);

-- Creator profiles policies
DROP POLICY IF EXISTS "Users can view own creator profile" ON creator_profiles;
CREATE POLICY "Users can view own creator profile" 
  ON creator_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own creator profile" ON creator_profiles;
CREATE POLICY "Users can insert own creator profile" 
  ON creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own creator profile" ON creator_profiles;
CREATE POLICY "Users can update own creator profile" 
  ON creator_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
DROP POLICY IF EXISTS "Admins can view all creator profiles" ON creator_profiles;
CREATE POLICY "Admins can view all creator profiles" 
  ON creator_profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update creator profiles" ON creator_profiles;
CREATE POLICY "Admins can update creator profiles" 
  ON creator_profiles FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Creators public read policy
DROP POLICY IF EXISTS "Public read creators" ON creators;
CREATE POLICY "Public read creators"
  ON creators FOR SELECT USING (true);

-- Creators insert/update policies
DROP POLICY IF EXISTS "Creators can insert own profile" ON creators;
CREATE POLICY "Creators can insert own profile"
  ON creators FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Creators can update own profile" ON creators;
CREATE POLICY "Creators can update own profile"
  ON creators FOR UPDATE USING (auth.uid() = user_id);

-- Campaigns policies
DROP POLICY IF EXISTS "Business read campaigns" ON campaigns;
CREATE POLICY "Business read campaigns"
  ON campaigns FOR SELECT USING (auth.uid() = business_id);

DROP POLICY IF EXISTS "Business insert campaigns" ON campaigns;
CREATE POLICY "Business insert campaigns"
  ON campaigns FOR INSERT WITH CHECK (auth.uid() = business_id);

DROP POLICY IF EXISTS "Business update campaigns" ON campaigns;
CREATE POLICY "Business update campaigns"
  ON campaigns FOR UPDATE USING (auth.uid() = business_id);

-- Campaign creators policies
DROP POLICY IF EXISTS "Business read campaign creators" ON campaign_creators;
CREATE POLICY "Business read campaign creators"
  ON campaign_creators FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE business_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Creators read own campaign assignments" ON campaign_creators;
CREATE POLICY "Creators read own campaign assignments"
  ON campaign_creators FOR SELECT USING (
    creator_id IN (
      SELECT id FROM creators WHERE user_id = auth.uid()
    )
  );

-- Campaign streams policies
DROP POLICY IF EXISTS "Business read stream logs" ON campaign_streams;
CREATE POLICY "Business read stream logs"
  ON campaign_streams FOR SELECT USING (
    campaign_creator_id IN (
      SELECT id FROM campaign_creators
      WHERE campaign_id IN (
        SELECT id FROM campaigns WHERE business_id = auth.uid()
      )
    )
  );

-- Business campaigns policies
DROP POLICY IF EXISTS "Public read business campaigns" ON business_campaigns;
CREATE POLICY "Public read business campaigns"
  ON business_campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business manage own campaigns" ON business_campaigns;
CREATE POLICY "Business manage own campaigns"
  ON business_campaigns FOR ALL USING (auth.uid() = business_id);

-- Saved campaigns policies
DROP POLICY IF EXISTS "Users manage saved campaigns" ON saved_campaigns;
CREATE POLICY "Users manage saved campaigns"
  ON saved_campaigns FOR ALL USING (auth.uid() = user_id);

-- Applications policies
DROP POLICY IF EXISTS "Users manage applications" ON applications;
CREATE POLICY "Users manage applications"
  ON applications FOR ALL USING (auth.uid() = user_id);

-- Messages policies
DROP POLICY IF EXISTS "Users view messages in conversations" ON messages;
CREATE POLICY "Users view messages in conversations"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
    )
  );

DROP POLICY IF EXISTS "Users insert messages" ON messages;
CREATE POLICY "Users insert messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Offers policies
DROP POLICY IF EXISTS "Creators view own offers" ON offers;
CREATE POLICY "Creators view own offers"
  ON offers FOR SELECT USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

-------------------------------------------------------------------
-- CREATE STORAGE BUCKETS
-------------------------------------------------------------------

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- Create business documents bucket
INSERT INTO storage.buckets (id, name, public) 
SELECT 'business-documents', 'business-documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'business-documents');

-- Create creator documents bucket
INSERT INTO storage.buckets (id, name, public) 
SELECT 'creator-documents', 'creator-documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'creator-documents');

-------------------------------------------------------------------
-- STORAGE POLICIES
-------------------------------------------------------------------

-- Avatars policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- Business documents policies
DROP POLICY IF EXISTS "Users can upload their own business documents" ON storage.objects;
CREATE POLICY "Users can upload their own business documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-documents' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can view their own business documents" ON storage.objects;
CREATE POLICY "Users can view their own business documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-documents' AND
    auth.role() = 'authenticated'
  );

-- Creator documents policies
DROP POLICY IF EXISTS "Creators can upload their own documents" ON storage.objects;
CREATE POLICY "Creators can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'creator-documents' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Creators can view their own documents" ON storage.objects;
CREATE POLICY "Creators can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'creator-documents' AND
    auth.role() = 'authenticated'
  );

-------------------------------------------------------------------
-- FUNCTIONS AND TRIGGERS
-------------------------------------------------------------------

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creator_profiles_updated_at ON creator_profiles;
CREATE TRIGGER update_creator_profiles_updated_at
  BEFORE UPDATE ON creator_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------
-- CREATE DEFAULT ADMIN USER
-------------------------------------------------------------------

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET role = 'admin' 
  WHERE id = (SELECT id FROM auth.users WHERE email = user_email);
  
  IF FOUND THEN
    RAISE NOTICE 'User % has been promoted to admin', user_email;
  ELSE
    RAISE NOTICE 'User % not found', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- To create an admin, run this after creating a user:
-- SELECT make_user_admin('admin@example.com');

-- Or to create admin directly (if you have auth.users access):
-- INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@example.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW())
-- RETURNING id;

-- Then insert into profiles with the returned ID:
-- INSERT INTO profiles (id, username, full_name, role) 
-- VALUES ('returned-uuid-here', 'admin', 'Administrator', 'admin');

-------------------------------------------------------------------
-- VERIFICATION QUERIES
-------------------------------------------------------------------

-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check foreign key relationships
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
