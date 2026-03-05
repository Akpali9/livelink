import { createBrowserRouter, RouteObject, redirect } from "react-router";
import { Home } from "./screens/home";
import { LoginPortal } from "./screens/login-portal";
import { CreatorLogin } from "./screens/creator-login";
import { BusinessLogin } from "./screens/business-login";
import { Browse } from "./screens/browse";
import { Profile } from "./screens/profile";
import { Dashboard } from "./screens/dashboard";
import { BusinessDashboard } from "./screens/business-dashboard";
import { BusinessProfile } from "./screens/business-profile";
import { CampaignCreation } from "./screens/campaign-creation";
import { CampaignTypeSelection } from "./screens/campaign-type-selection";
import { CampaignSetupBanner } from "./screens/campaign-setup-banner";
import { CampaignSetupBannerPromo } from "./screens/campaign-setup-banner-promo";
import { CampaignSetupPromoOnly } from "./screens/campaign-setup-promo-only";
import { BecomeCreator, AdminApplicationQueue } from "./screens/become-creator";
import { BecomeBusiness } from "./screens/become-business";
import { BrowseBusinesses } from "./screens/browse-businesses";
import { GigAccepted } from "./screens/gig-accepted";
import { BusinessSubmissionSuccess } from "./screens/business-submission-success";
import { Campaigns } from "./screens/campaigns";
import { BusinessCampaignDetail } from "./screens/business-campaign-detail";
import { BusinessCampaignCreators } from "./screens/business-campaign-creators";
import { CreatorCampaignDetail } from "./screens/creator-campaign-detail";
import { LiveCampaignUpdate } from "./screens/live-campaign-update";
import { MessagesInbox } from "./screens/messages-inbox";
import { MessageThread } from "./screens/message-thread";
import { CampaignConfirm } from "./screens/campaign-confirm";
import { PaymentHeld } from "./screens/payment-held";
import { CampaignAcceptedBusiness } from "./screens/campaign-accepted-business";
import { CampaignDeclined } from "./screens/campaign-declined";
import { Notifications } from "./screens/notifications";
import { UpcomingGigDetail } from "./screens/upcoming-gig-detail";
import { BusinessCampaignOverview } from "./screens/business-campaign-overview";
import { RootLayout } from "./components/layout";
import { CampaignDetails } from "./screens/campaign-details";
import { Settings } from "./screens/settings";
import { BusinessSettings } from "./screens/business-settings";
import { supabase } from "./lib/supabase";

// Authentication loader functions
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return redirect("/login/portal");
  }
  
  return null;
}

async function requireCreator() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return redirect("/login/portal");
  }
  
  const userType = session.user.user_metadata?.user_type;
  
  if (userType !== 'creator') {
    return redirect("/business/dashboard");
  }
  
  return null;
}

async function requireBusiness() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return redirect("/login/portal");
  }
  
  const userType = session.user.user_metadata?.user_type;
  
  if (userType !== 'business') {
    return redirect("/dashboard");
  }
  
  return null;
}

async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return redirect("/login/portal");
  }
  
  // Check if user has admin role (you can customize this based on your admin logic)
  const isAdmin = session.user.app_metadata?.role === 'admin';
  
  if (!isAdmin) {
    return redirect("/");
  }
  
  return null;
}

async function redirectIfAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const userType = session.user.user_metadata?.user_type;
    
    if (userType === 'creator') {
      return redirect("/dashboard");
    } else if (userType === 'business') {
      return redirect("/business/dashboard");
    }
  }
  
  return null;
}

async function loadUser() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { user: null, profile: null };
  }
  
  const userType = session.user.user_metadata?.user_type;
  
  if (userType === 'creator') {
    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    return { user: session.user, profile, userType };
  } else if (userType === 'business') {
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    return { user: session.user, profile, userType };
  }
  
  return { user: session.user, profile: null, userType };
}

const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    loader: loadUser,
    children: [
      // Public routes
      { 
        index: true, 
        Component: Home,
        loader: redirectIfAuthenticated 
      },
      
      // Auth routes (redirect if already logged in)
      { 
        path: "login/portal", 
        Component: LoginPortal,
        loader: redirectIfAuthenticated 
      },
      { 
        path: "login/creator", 
        Component: CreatorLogin,
        loader: redirectIfAuthenticated 
      },
      { 
        path: "login/business", 
        Component: BusinessLogin,
        loader: redirectIfAuthenticated 
      },
      
      // Registration routes (redirect if already logged in)
      { 
        path: "become-creator", 
        Component: BecomeCreator,
        loader: redirectIfAuthenticated 
      },
      { 
        path: "become-business", 
        Component: BecomeBusiness,
        loader: redirectIfAuthenticated 
      },
      
      // Creator protected routes
      { 
        path: "dashboard", 
        Component: Dashboard,
        loader: requireCreator 
      },
      { 
        path: "profile/:id", 
        Component: Profile,
        loader: requireCreator 
      },
      { 
        path: "campaigns", 
        Component: Campaigns,
        loader: requireCreator 
      },
      { 
        path: "creator/campaign/:id", 
        Component: CreatorCampaignDetail,
        loader: requireCreator 
      },
      { 
        path: "creator/upcoming-gig/:id", 
        Component: UpcomingGigDetail,
        loader: requireCreator 
      },
      { 
        path: "campaign/live-update/:id", 
        Component: LiveCampaignUpdate,
        loader: requireCreator 
      },
      { 
        path: "browse-businesses", 
        Component: BrowseBusinesses,
        loader: requireCreator 
      },
      { 
        path: "gig-accepted", 
        Component: GigAccepted,
        loader: requireCreator 
      },
      
      // Business protected routes
      { 
        path: "business/dashboard", 
        Component: BusinessDashboard,
        loader: requireBusiness 
      },
      { 
        path: "business/profile", 
        Component: BusinessProfile,
        loader: requireBusiness 
      },
      { 
        path: "campaign/type", 
        Component: CampaignTypeSelection,
        loader: requireBusiness 
      },
      { 
        path: "campaign/setup/banner", 
        Component: CampaignSetupBanner,
        loader: requireBusiness 
      },
      { 
        path: "campaign/setup/banner-promo", 
        Component: CampaignSetupBannerPromo,
        loader: requireBusiness 
      },
      { 
        path: "campaign/setup/promo-only", 
        Component: CampaignSetupPromoOnly,
        loader: requireBusiness 
      },
      { 
        path: "campaign/create", 
        Component: CampaignCreation,
        loader: requireBusiness 
      },
      { 
        path: "campaign/confirm", 
        Component: CampaignConfirm,
        loader: requireBusiness 
      },
      { 
        path: "payment/held", 
        Component: PaymentHeld,
        loader: requireBusiness 
      },
      { 
        path: "campaign/confirmed", 
        Component: CampaignAcceptedBusiness,
        loader: requireBusiness 
      },
      { 
        path: "campaign/declined", 
        Component: CampaignDeclined,
        loader: requireBusiness 
      },
      { 
        path: "campaign/:id", 
        Component: CampaignDetails,
        loader: requireBusiness 
      },
      { 
        path: "business/campaign/overview/:id", 
        Component: BusinessCampaignOverview,
        loader: requireBusiness 
      },
      { 
        path: "business/campaign/:id", 
        Component: BusinessCampaignCreators,
        loader: requireBusiness 
      },
      { 
        path: "business/campaign/:campaignId/creator/:creatorId", 
        Component: BusinessCampaignDetail,
        loader: requireBusiness 
      },
      { 
        path: "business/submission-success", 
        Component: BusinessSubmissionSuccess,
        loader: requireBusiness 
      },
      { 
        path: "browse", 
        Component: Browse,
        loader: requireBusiness 
      },
      
      // Protected routes (both creator and business)
      { 
        path: "messages", 
        Component: MessagesInbox,
        loader: requireAuth 
      },
      { 
        path: "messages/:id", 
        Component: MessageThread,
        loader: requireAuth 
      },
      { 
        path: "notifications", 
        Component: Notifications,
        loader: requireAuth 
      },
      { 
        path: "settings", 
        Component: Settings,
        loader: requireCreator // Only creators can access creator settings
      },
      { 
        path: "business/settings", 
        Component: BusinessSettings,
        loader: requireBusiness // Only businesses can access business settings
      },
      
      // Admin protected routes
      { 
        path: "admin/applications", 
        Component: AdminApplicationQueue,
        loader: requireAdmin 
      },
    ],
  },
];
import { AdminDashboard } from "./screens/admin-dashboard";

// Add this loader function
async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return redirect("/login/portal");
  }
  
  // Check if user is admin
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (!adminProfile) {
    return redirect("/");
  }
  
  return null;
}

// Add this to your routes array
{
  path: "admin",
  children: [
    { 
      index: true, 
      Component: AdminDashboard,
      loader: requireAdmin 
    },
    { 
      path: "applications", 
      Component: AdminApplicationQueue,
      loader: requireAdmin 
    }
  ]
}

export const router = createBrowserRouter(routes);
