
// Note: This file relies on the Supabase UMD script loaded in index.html,
// which creates a global `supabase` object.

// Inform TypeScript that a global 'supabase' object exists and has a createClient method.
declare const supabase: {
  createClient: (url: string, key: string) => any;
};

const supabaseUrl = 'https://gkwwlyurjkadwmulejrb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd3dseXVyamthZHdtdWxlanJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzE4NDYsImV4cCI6MjA3NDQ0Nzg0Nn0.otJbPE9QiQx7BYS4E7HPZTbPTbLCMiV24OXnbh5qwTg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

// Destructure createClient from the global supabase object
const { createClient } = supabase;

// Create the client instance
const supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);

// Export the instance under the name 'supabase' so other modules can import it.
export { supabaseInstance as supabase };