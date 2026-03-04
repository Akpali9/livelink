import { createBrowserRouter, RouteObject } from "react-router";
import { Home } from "./screens/home";
import { LoginPortal } from "./screens/login-portal";
import { CreatorLogin } from "./screens/creator-login";
import { BusinessLogin } from "./screens/business-login";
import { Browse } from "./screens/browse";
import { Profile } from "./screens/profile";
import {AdminDashboard} from "./screen/admin-dashboard";
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

const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "login/portal", Component: LoginPortal },
      { path: "admin", Component: AdminDashboard },
      { path: "login/creator", Component: CreatorLogin },
      { path: "login/business", Component: BusinessLogin },
      { path: "browse", Component: Browse },
      { path: "profile/:id", Component: Profile },
      { path: "dashboard", Component: Dashboard },
      { path: "business/dashboard", Component: BusinessDashboard },
      { path: "business/profile", Component: BusinessProfile },
      { path: "campaign/type", Component: CampaignTypeSelection },
      { path: "campaign/setup/banner", Component: CampaignSetupBanner },
      { path: "campaign/setup/banner-promo", Component: CampaignSetupBannerPromo },
      { path: "campaign/setup/promo-only", Component: CampaignSetupPromoOnly },
      { path: "campaign/create", Component: CampaignCreation },
      { path: "campaign/confirm", Component: CampaignConfirm },
      { path: "payment/held", Component: PaymentHeld },
      { path: "campaign/confirmed", Component: CampaignAcceptedBusiness },
      { path: "campaign/declined", Component: CampaignDeclined },
      { path: "campaigns", Component: Campaigns },
      { path: "campaign/:id", Component: CampaignDetails },
      { path: "business/campaign/overview/:id", Component: BusinessCampaignOverview },
      { path: "business/campaign/:id", Component: BusinessCampaignCreators },
      { path: "business/campaign/:campaignId/creator/:creatorId", Component: BusinessCampaignDetail },
      { path: "creator/campaign/:id", Component: CreatorCampaignDetail },
      { path: "creator/upcoming-gig/:id", Component: UpcomingGigDetail },
      { path: "campaign/live-update/:id", Component: LiveCampaignUpdate },
      { path: "become-creator", Component: BecomeCreator },
      { path: "become-business", Component: BecomeBusiness },
      { path: "browse-businesses", Component: BrowseBusinesses },
      { path: "admin/applications", Component: AdminApplicationQueue },
      { path: "gig-accepted", Component: GigAccepted },
      { path: "business/submission-success", Component: BusinessSubmissionSuccess },
      { path: "messages", Component: MessagesInbox },
      { path: "messages/:id", Component: MessageThread },
      { path: "notifications", Component: Notifications },
      { path: "settings", Component: Settings },
      { path: "business/settings", Component: BusinessSettings },
    ],
  },
];

export const router = createBrowserRouter(routes);
