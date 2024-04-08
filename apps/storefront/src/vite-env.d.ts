/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME?: string;
    readonly VITE_APP_CONFIG_BASE?: string;
    readonly VITE_APP_ORDERCLOUD_BASE_API_URL?: string;
    readonly VITE_APP_ORDERCLOUD_CLIENT_ID: string;
    readonly VITE_APP_ORDERCLOUD_SCOPE?: string;
    readonly VITE_APP_ORDERCLOUD_CUSTOM_SCOPE?: string;
    readonly VITE_APP_ORDERCLOUD_ALLOW_ANONYMOUS?: string;
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }