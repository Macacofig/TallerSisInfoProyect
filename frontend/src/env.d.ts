interface ImportMetaEnv {
  readonly BACKEND_URL?: string;
  readonly LOCAL_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
