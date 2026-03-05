export interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  total_earned: number;
  pending: number;
  paid_out: number;
  date_of_birth?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  streaming_frequency?: string;
  stream_duration?: string;
  streaming_days?: string[];
  typical_time?: string;
  avg_concurrent?: number;
  avg_peak?: number;
  avg_weekly?: number;
  categories?: string[];
  audience_bio?: string;
  referral_code?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  business_name: string;
  full_name: string;
  job_title?: string;
  email?: string;
  phone_number?: string;
  phone_country_code?: string;
  industry?: string;
  description?: string;
  website?: string;
  country?: string;
  city?: string;
  postcode?: string;
  operating_time?: string;
  goals?: string[];
  campaign_type?: string;
  budget?: string;
  age_min?: number;
  age_max?: number;
  gender_target?: string[];
  target_location?: string;
  referral_code?: string;
  id_verification_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StatusCounts {
  requested: number;
  pending: number;
  completed: number;
}

export interface IncomingRequest {
  id: string;
  business: string;
  name: string;
  type: string;
  streams: number;
  price: number;
  days_left: number;
  logo: string | null;
  status: string;
}

export interface LiveCampaign {
  id: string;
  business: string;
  name: string;
  logo: string | null;
  session_earnings: number;
  stream_time: string;
  progress: number;
  remaining_mins: number;
  is_live: boolean;
}

export interface Application {
  id: string;
  business: string;
  logo: string | null;
  type: string;
  amount?: number;
  status: string;
  applied_at: string;
}

export interface UpcomingCampaign {
  id: string;
  business: string;
  logo: string | null;
  start_date: string;
  package: string;
}

export interface Platform {
  id?: string;
  user_id?: string;
  platform_type: string;
  username: string;
  profile_url: string;
}

export interface SocialMedia {
  id?: string;
  user_id?: string;
  platform: string;
  handle: string;
}
