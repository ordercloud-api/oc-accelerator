/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_CONFIG_BASE?: string
  readonly VITE_APP_ORDERCLOUD_BASE_API_URL?: string
  readonly VITE_APP_ORDERCLOUD_CLIENT_ID: string
  readonly VITE_APP_ORDERCLOUD_OPENIDCONNECT_ENABLE?: string
  readonly VITE_APP_ORDERCLOUD_OPENIDCONNECT_CONFIG_ID?: string
  readonly VITE_APP_ORDERCLOUD_OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME?: string
  readonly VITE_APP_ORDERCLOUD_OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME?: string
  readonly VITE_APP_ORDERCLOUD_OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME?: string

  VITE_APP_PUBLIC_THEME_COLOR_PRIMARY?: string
  VITE_APP_PUBLIC_THEME_COLOR_SECONDARY?: string
  VITE_APP_PUBLIC_THEME_COLOR_ACCENT?: string
  VITE_APP_PUBLIC_THEME_LOGO_URL?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
