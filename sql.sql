-- Business profiles table
CREATE TABLE business_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  
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
  socials JSONB DEFAULT '[]',
  
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

-- Business applications tracking
CREATE TABLE business_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES business_profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_business_profiles_user ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON business_profiles(status);
CREATE INDEX idx_business_applications_business ON business_applications(business_id);

-- Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own business profile" 
  ON business_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile" 
  ON business_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile" 
  ON business_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own applications" 
  ON business_applications FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM business_profiles 
    WHERE business_profiles.id = business_applications.business_id 
    AND business_profiles.user_id = auth.uid()
  ));

-- Create storage bucket for business documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-documents', 'business-documents', true);

-- Storage policy for business documents
CREATE POLICY "Users can upload their own business documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own business documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-documents' AND
    auth.role() = 'authenticated'
  );
  -- Creator profiles table
CREATE TABLE creator_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  
  -- Personal Info
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  phone_country_code TEXT DEFAULT '+44',
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Streaming Platforms
  platforms JSONB DEFAULT '[]',
  
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

-- Creator applications tracking
CREATE TABLE creator_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES creator_profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator analytics submissions
CREATE TABLE creator_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES creator_profiles(id) NOT NULL,
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

-- Create indexes
CREATE INDEX idx_creator_profiles_user ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_status ON creator_profiles(status);
CREATE INDEX idx_creator_applications_creator ON creator_applications(creator_id);
CREATE INDEX idx_creator_analytics_creator_month ON creator_analytics(creator_id, month);

-- Enable RLS
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own creator profile" 
  ON creator_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creator profile" 
  ON creator_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own creator profile" 
  ON creator_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admin policies (you'll need to set up admin roles)
CREATE POLICY "Admins can view all creator profiles" 
  ON creator_profiles FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update creator profiles" 
  ON creator_profiles FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create storage bucket for creator documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('creator-documents', 'creator-documents', true);

-- Storage policy for creator documents
CREATE POLICY "Creators can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'creator-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Creators can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'creator-documents' AND
    auth.role() = 'authenticated'
  );
  -- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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

-- Create social connections table
CREATE TABLE social_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_social_connections_user ON social_connections(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own social connections" 
  ON social_connections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social connections" 
  ON social_connections FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user signup
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
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  -- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- Allow public to view avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );
  create table businesses (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  created_at timestamp with time zone default timezone('utc', now())
);
alter table businesses enable row level security;

create policy "Users can manage their own business profile"
on businesses
for all
using (auth.uid() = id);
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  rating numeric default 5.0,
  avg_viewers integer,
  price integer,
  country text,
  category text,
  platforms text[],
  tags text[],
  created_at timestamp with time zone default timezone('utc', now())
);

alter table creators enable row level security;

create policy "Public read creators"
on creators
for select
using (true);
create table if not exists campaign_creators (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  creator_id uuid references creators(id) on delete cascade,
  status text default 'NOT STARTED',
  streams_completed integer default 0,
  streams_required integer default 4,
  created_at timestamp with time zone default timezone('utc', now())
);
alter table creators enable row level security;
alter table campaigns enable row level security;
alter table campaign_creators enable row level security;

-- Business can read their campaigns
create policy "Business read campaigns"
on campaigns
for select
using (auth.uid() = business_id);

-- Business can read creators linked to their campaign
create policy "Business read campaign creators"
on campaign_creators
for select
using (
  campaign_id in (
    select id from campaigns where business_id = auth.uid()
  )
);

-- Allow reading creators publicly
create policy "Public read creators"
on creators
for select
using (true);
alter table campaigns enable row level security;
alter table campaign_creators enable row level security;
alter table campaign_streams enable row level security;

create policy "Business read own campaigns"
on campaigns
for select
using (auth.uid() = business_id);

create policy "Business read linked creators"
on campaign_creators
for select
using (
  campaign_id in (
    select id from campaigns where business_id = auth.uid()
  )
);

create policy "Business read stream logs"
on campaign_streams
for select
using (
  campaign_creator_id in (
    select id from campaign_creators
    where campaign_id in (
      select id from campaigns where business_id = auth.uid()
    )
  )
);
create table if not exists campaign_streams (
  id uuid primary key default gen_random_uuid(),
  campaign_creator_id uuid references campaign_creators(id) on delete cascade,
  stream_number integer,
  status text default 'UPCOMING',
  stream_date date,
  duration text,
  proof_url text,
  created_at timestamp with time zone default timezone('utc', now())
);
alter table campaign_promo_codes enable row level security;
alter table campaign_payout_cycles enable row level security;

create policy "Business read promo codes"
on campaign_promo_codes
for select
using (
  campaign_id in (
    select id from campaigns where business_id = auth.uid()
  )
);

create policy "Business read payout cycles"
on campaign_payout_cycles
for select
using (
  campaign_creator_id in (
    select id from campaign_creators
    where campaign_id in (
      select id from campaigns where business_id = auth.uid()
    )
  )
);
create table if not exists campaign_payout_cycles (
  id uuid primary key default gen_random_uuid(),
  campaign_creator_id uuid references campaign_creators(id) on delete cascade,
  cycle_number integer,
  stream_range text,
  amount numeric,
  status text default 'UPCOMING',
  created_at timestamp with time zone default timezone('utc', now())
);
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  type text not null, -- "Banner + Code", "Banner Only", etc
  status text default 'PENDING REVIEW', -- ACTIVE | OPEN | PENDING REVIEW | COMPLETED
  price text,
  streams_total integer default 0,
  streams_completed integer default 0,
  creators_target integer default 1,
  image text,
  is_accepting boolean default true,
  created_at timestamp default now()
);
create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  website text,
  bio text,
  created_at timestamp default now()
);
-- creators
create table creators (
  id uuid primary key,
  name text,
  username text,
  avatar text,
  verified boolean,
  location text,
  platforms jsonb,
  niches text[],
  bio text,
  availability text,
  stats jsonb,
  packages jsonb
);

-- offers
create table offers (
  id serial primary key,
  creator_id uuid references creators(id),
  streams int,
  rate numeric,
  type text,
  message text,
  created_at timestamp default now()
);
-- Conversations
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  campaign text,
  logo text
);

-- Messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL, -- 'business' or 'creator'
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  seen boolean DEFAULT false
);
create table public.business_campaigns (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    industry text not null,
    logo text,
    partnership_type text check (partnership_type in ('Pay + Code', 'Paying', 'Code Only', 'Open to Offers')) not null,
    pay_rate text,
    min_viewers int not null default 0,
    location text,
    description text,
    niche_tags text[],
    response_rate text,
    closing_date date,
    is_verified boolean default false,
    is_featured boolean default false,
    budget_range text,
    about text
);
create table public.saved_campaigns (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    campaign_id uuid references public.business_campaigns(id) on delete cascade,
    created_at timestamp with time zone default now(),
    unique(user_id, campaign_id)
);
create table public.applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    campaign_id uuid references public.business_campaigns(id) on delete cascade,
    status text check (status in ('pending','approved','rejected')) default 'pending',
    created_at timestamp with time zone default now(),
    unique(user_id, campaign_id)
);