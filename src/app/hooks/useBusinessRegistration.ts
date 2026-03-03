
import { supabase } from "../lib/supabase";

export function useBusinessRegistration() {
  const submitRegistration = async (data: any, idFile: File) => {
    try {
      // 1. Upload ID file to Supabase Storage
      const fileExt = idFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("business-ids")
        .upload(fileName, idFile);

      if (uploadError) throw uploadError;

      const { publicUrl } = supabase.storage.from("business-ids").getPublicUrl(fileName);

      // 2. Hash password (optional if you use Supabase Auth)
      const hashedPassword = data.password; // For demo. Use bcrypt in production

      // 3. Insert into businesses table
      const { error } = await supabase
        .from("businesses")
        .insert({
          full_name: data.fullName,
          job_title: data.jobTitle,
          email: data.email,
          password_hash: hashedPassword,
          phone_number: data.phoneNumber,
          phone_country_code: data.phoneCountryCode,

          business_name: data.businessName,
          business_type: data.businessType,
          industry: data.industry,
          description: data.description,
          website: data.website,
          socials: data.socials,
          
          country: data.country,
          city: data.city,
          postcode: data.postcode,
          operating_time: data.operatingTime,
          
          goals: data.goals,
          campaign_type: data.campaignType,
          budget: data.budget,
          age_min: data.ageMin,
          age_max: data.ageMax,
          gender: data.gender,
          target_location: data.targetLocation,
          
          id_file_url: publicUrl,
          referral: data.referral,
          agree_to_terms: data.agreeToTerms,
        });

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { submitRegistration, loading: false, error: null };
}