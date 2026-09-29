/// <reference types="vite/client" />

/**
 * Build-time variables (docs/DEPLOYMENT.md). Both are public by design: the
 * data is protected by Row Level Security (D-031, D-060). No secret ever
 * goes in a VITE_ variable, which is inlined into the public bundle.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
