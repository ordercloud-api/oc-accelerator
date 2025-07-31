
//Basic auth configuration
const APP_NAME = import.meta.env.VITE_APP_NAME || "Application Name";
const BASE_API_URL =
  import.meta.env.VITE_APP_ORDERCLOUD_BASE_API_URL ||
  "https://api.ordercloud.io/v1";
const CLIENT_ID = import.meta.env.VITE_APP_ORDERCLOUD_CLIENT_ID;

//Anonymous auth configuration
const ALLOW_ANONYMOUS_STRING = import.meta.env
  .VITE_APP_ORDERCLOUD_ALLOW_ANONYMOUS;
const ALLOW_ANONYMOUS: boolean = Boolean(ALLOW_ANONYMOUS_STRING === "true");

// OpenIDConnect Settings
const OPENID_CONNECT_ENABLED = import.meta.env.VITE_APP_ORDERCLOUD_OPENIDCONNECT_ENABLED === 'true'
const OPENID_CONNECT_CONFIG_ID = import.meta.env.VITE_APP_ORDERCLOUD_OPENIDCONNECT_CONFIG_ID || ''
const OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME = import.meta.env.VITE_APP_ORDERCLOUD_OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME || ''
const OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME = import.meta.env.VITE_APP_ORDERCLOUD_OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME || ''
const OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME = import.meta.env.VITE_APP_ORDERCLOUD_OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME || ''

//Other configs
const IS_MULTILOCATION_STRING = import.meta.env
  .VITE_APP_ORDERCLOUD_MULTILOCATION_INVENTORY;
const IS_MULTI_LOCATION_INVENTORY = Boolean(IS_MULTILOCATION_STRING === "true");
const IS_AUTO_APPLY_STRING = import.meta.env
  .VITE_APP_ORDERCLOUD_AUTO_APPLY_PROMOS;
const IS_AUTO_APPLY = Boolean(IS_AUTO_APPLY_STRING === "true");


const BRAND_COLOR_PRIMARY =
  import.meta.env.VITE_APP_ORDERCLOUD_BRAND_COLOR_PRIMARY || "";
const BRAND_COLOR_SECONDARY =
  import.meta.env.VITE_APP_ORDERCLOUD_BRAND_COLOR_SECONDARY || "";
const BRAND_COLOR_ACCENT =
  import.meta.env.VITE_APP_ORDERCLOUD_BRAND_COLOR_ACCENT || "";

  const BRAND_LOGO_LIGHT =
    import.meta.env.VITE_APP_ORDERCLOUD_BRAND_LOGO_LIGHT || "";
  const BRAND_LOGO_DARK =
    import.meta.env.VITE_APP_ORDERCLOUD_BRAND_LOGO_DARK || "";
  const BRAND_FAVICON_LIGHT =
    import.meta.env.VITE_APP_ORDERCLOUD_BRAND_LOGO_LIGHT || "";
  const BRAND_FAVICON_DARK =
    import.meta.env.VITE_APP_ORDERCLOUD_BRAND_LOGO_DARK || "";

// Dashboard configs
const DASHBOARD_HERO_TAGLINE =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_HERO_TAGLINE ||
  `Welcome to ${APP_NAME} storefront app`;
const DASHBOARD_HERO_IMAGE = import.meta.env
  .VITE_APP_ORDERCLOUD_DASHBOARD_HERO_IMAGE;
const DASHBOARD_HERO_CTA_TEXT =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_HERO_CTA_TEXT ||
  "Call to action";
const DASHBOARD_HERO_CTA_LINK = import.meta.env
  .VITE_APP_ORDERCLOUD_DASHBOARD_HERO_CTA_LINK;

const DASHBOARD_SECONDARY_IMAGE = import.meta.env
  .VITE_APP_ORDERCLOUD_DASHBOARD_SECONDARY_IMAGE;
const DASHBOARD_SECONDARY_HEADING =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_SECONDARY_HEADING ||
  "Secondary heading text";
const DASHBOARD_SECONDARY_DESCRIPTION =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_SECONDARY_DESCRIPTION ||
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const DASHBOARD_SECONDARY_CTA_TEXT =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_SECONDARY_CTA_TEXT ||
  "Call to action";
const DASHBOARD_SECONDARY_CTA_LINK = import.meta.env
  .VITE_APP_ORDERCLOUD_DASHBOARD_SECONDARY_CTA_LINK;

const DASHBOARD_TERTIARY_IMAGE = import.meta.env
  .VITE_APP_ORDERCLOUD_DASHBOARD_TERTIARY_IMAGE;
const DASHBOARD_TERTIARY_HEADING =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_TERTIARY_HEADING ||
  "Tertiary heading text";
const DASHBOARD_TERTIARY_DESCRIPTION =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_TERTIARY_DESCRIPTION ||
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const DASHBOARD_TERTIARY_CTA_TEXT =
  import.meta.env.VITE_APP_ORDERCLOUD_DASHBOARD_TERTIARY_CTA_TEXT ||
  "Call to action";
const DASHBOARD_TERTIARY_CTA_LINK = import.meta.env
  .VITE_APP_ORDERCLOUD_DASHBOARD_TERTIARY_CTA_LINK;

enum PAYMENT_PROVIDERS {
  CARD_CONNECT,
  PAYPAL,
  STRIPE,
  BLUESNAP,
}

const PAYMENT_PROVIDER = import.meta.env
  .VITE_APP_PAYMENT_PROVIDER as PAYMENT_PROVIDERS;

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export {
  APP_NAME,
  BASE_API_URL,
  CLIENT_ID,
  ALLOW_ANONYMOUS,
  IS_MULTI_LOCATION_INVENTORY,
  IS_AUTO_APPLY,

  OPENID_CONNECT_ENABLED,
  OPENID_CONNECT_CONFIG_ID,
  OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME,
  OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME,
  OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME,

  BRAND_COLOR_PRIMARY,
  BRAND_COLOR_SECONDARY,
  BRAND_COLOR_ACCENT,

  BRAND_LOGO_LIGHT,
  BRAND_LOGO_DARK,
  BRAND_FAVICON_LIGHT,
  BRAND_FAVICON_DARK,

  DASHBOARD_HERO_TAGLINE,
  DASHBOARD_HERO_IMAGE,
  DASHBOARD_HERO_CTA_LINK,
  DASHBOARD_HERO_CTA_TEXT,
  DASHBOARD_SECONDARY_IMAGE,
  DASHBOARD_SECONDARY_HEADING,
  DASHBOARD_SECONDARY_DESCRIPTION,
  DASHBOARD_SECONDARY_CTA_TEXT,
  DASHBOARD_SECONDARY_CTA_LINK,
  DASHBOARD_TERTIARY_IMAGE,
  DASHBOARD_TERTIARY_HEADING,
  DASHBOARD_TERTIARY_DESCRIPTION,
  DASHBOARD_TERTIARY_CTA_TEXT,
  DASHBOARD_TERTIARY_CTA_LINK,
  PAYMENT_PROVIDER,
  PAYMENT_PROVIDERS,
  US_STATES,
};
