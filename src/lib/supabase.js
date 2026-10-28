import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const SUPABASE_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase environment variables missing! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment or .env file."
  );
}

// Create Supabase Client instance with auto-reconnect and Realtime configured
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      params: {
        eventsPerSecond: 20
      }
    }
  }
);

/**
 * Health check helper to verify Supabase database and API connectivity.
 * @returns {Promise<{ ok: boolean, status: string, error: string | null }>}
 */
export const checkSupabaseHealth = async () => {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      status: SUPABASE_STATUS.ERROR,
      error: 'Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).'
    };
  }

  try {
    // Attempt fast server time RPC or lightweight select query with a 6-second timeout
    const testPromise = (async () => {
      const { data, error } = await supabase.rpc('get_server_time');
      if (!error && data) return { ok: true };

      // Fallback: check rooms table
      const { error: queryErr } = await supabase.from('rooms').select('id').limit(1);
      if (!queryErr) return { ok: true };

      throw new Error(queryErr.message || 'Database query failed');
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out. Supabase database may be paused or starting up.')), 6000)
    );

    await Promise.race([testPromise, timeoutPromise]);
    return { ok: true, status: SUPABASE_STATUS.CONNECTED, error: null };
  } catch (err) {
    return {
      ok: false,
      status: SUPABASE_STATUS.ERROR,
      error: err.message || 'Unable to connect to Supabase.'
    };
  }
};
