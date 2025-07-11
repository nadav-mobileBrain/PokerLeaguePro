// types/database.ts

// Define the structure of a League object based on your Supabase table
export interface League {
  id: string; // UUID
  name: string;
  description: string | null;
  is_public: boolean;
  default_buy_in: number | null;
  currency: string;
  created_at: string; // Timestamptz
  updated_at: string; // Timestamptz
  banner_url: string | null; // Add the banner URL field
  invite_code: string | null; // Add the invite code field (nullable for now)
  // Add any other relevant fields from your leagues table
}

// Define the structure of a User object based on your public.users table
export interface UserProfile {
  id: string; // UUID (Supabase internal ID)
  clerk_id: string; // Clerk's user ID
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null; // Biographical information
  created_at: string; // Timestamptz
  updated_at: string; // Timestamptz
  // Add other fields as needed
}

// Define the structure for a league member (joining users and leagues)
export interface LeagueMember {
  league_id: string;
  user_id: string;
  role: "league_admin" | "member"; // Simplified role system
  joined_at: string;
  // Include the joined user profile data
  users: UserProfile | null;
}
