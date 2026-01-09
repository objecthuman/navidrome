/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAVIDROME_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
