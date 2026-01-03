/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string;
  readonly VITE_FOURSQUARE_API_KEY: string;
  readonly VITE_CURRENCY_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
