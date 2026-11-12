import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ReportStatus = 'nieuw' | 'in_behandeling' | 'afgerond';

export interface Report {
  id: string;
  name: string;
  location_type: string;
  country: string | null;
  location: string;
  category: string;
  description: string;
  extra_info: string | null;
  photo_count: number;
  photo_urls: string[] | null;
  status: ReportStatus;
  created_at: string;
}
