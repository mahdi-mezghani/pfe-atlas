type EnvLike = Record<string, string | undefined>;

const FALLBACK_PROJECT_ID = 'opweromunjvxzomvzhlf';

function readEnvValue(env: EnvLike, names: string[]): string | undefined {
  for (const name of names) {
    const value = env[name];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function getClientEnv(): EnvLike {
  if (typeof import.meta !== 'undefined' && 'env' in import.meta) {
    return import.meta.env as EnvLike;
  }

  return {};
}

function getProcessEnv(): EnvLike {
  return typeof process !== 'undefined' ? process.env : {};
}

export function getSupabaseProjectId(): string | undefined {
  const env = getClientEnv();
  const processEnv = getProcessEnv();

  return readEnvValue(env, ['VITE_SUPABASE_PROJECT_ID'])
    ?? readEnvValue(processEnv, ['SUPABASE_PROJECT_ID'])
    ?? FALLBACK_PROJECT_ID;
}

export function getSupabaseUrl(): string | undefined {
  const env = getClientEnv();
  const processEnv = getProcessEnv();

  return readEnvValue(env, ['VITE_SUPABASE_URL'])
    ?? readEnvValue(processEnv, ['SUPABASE_URL'])
    ?? `https://${getSupabaseProjectId()}.supabase.co`;
}

export function getSupabaseAnonKey(): string | undefined {
  const env = getClientEnv();
  const processEnv = getProcessEnv();

  return readEnvValue(env, ['VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'])
    ?? readEnvValue(processEnv, ['SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY']);
}

export function getSupabaseServiceRoleKey(): string | undefined {
  const processEnv = getProcessEnv();
  return readEnvValue(processEnv, ['SUPABASE_SERVICE_ROLE_KEY']);
}
