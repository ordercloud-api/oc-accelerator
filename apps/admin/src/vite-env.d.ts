/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_CONFIG_BASE?: string
  readonly VITE_APP_ORDERCLOUD_BASE_API_URL?: string
  readonly VITE_APP_ORDERCLOUD_CLIENT_ID: string
  readonly VITE_APP_ORDERCLOUD_ALLOW_ANONYMOUS?: string

  VITE_APP_PUBLIC_THEME_COLOR_PRIMARY?: string
  VITE_APP_PUBLIC_THEME_COLOR_SECONDARY?: string
  VITE_APP_PUBLIC_THEME_COLOR_ACCENT?: string
  VITE_APP_PUBLIC_THEME_LOGO_URL?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
