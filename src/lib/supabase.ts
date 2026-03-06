import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Debug logging to help troubleshoot configuration
console.log('Supabase Configuration Check:');
console.log('- URL:', supabaseUrl);
console.log('- Key exists:', supabaseAnonKey !== 'placeholder-key');
console.log('- Environment variables loaded:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('supabase.co') &&
         supabaseAnonKey.length > 20;
  
  console.log('Is Supabase configured?', isConfigured);
  return isConfigured;
};

// Database types
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address: string;
          date_of_birth: string;
          emergency_contact: string;
          emergency_phone: string;
          medical_notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      caregivers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address: string;
          certifications: string[];
          experience: string;
          availability: string;
          skills: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['caregivers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['caregivers']['Insert']>;
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          type: string;
          description: string;
          date: string;
          time: string;
          location: string;
          capacity: number;
          registered: number;
          expires_at: string;
          sponsor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['opportunities']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['opportunities']['Insert']>;
      };
      volunteers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address: string;
          skills: string[];
          availability: string;
          emergency_contact: string;
          emergency_phone: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['volunteers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['volunteers']['Insert']>;
      };
      sponsors: {
        Row: {
          id: string;
          name: string;
          type: string;
          contact_person: string;
          email: string;
          phone: string;
          address: string;
          website: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sponsors']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sponsors']['Insert']>;
      };
    };
  };
}
