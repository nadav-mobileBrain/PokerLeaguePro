
import { create } from 'zustand';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { UserProfile } from '@/types/database';

// Simple cache to prevent race conditions in user creation
const userCreationPromises = new Map<string, Promise<UserProfile>>();

interface UserState {
  supabaseProfile: UserProfile | null;
  loading: boolean;
  onboardingCompleted: boolean;
  fetchSupabaseProfile: (userId: string) => Promise<void>;
  ensureUserProfile: (userId: string, displayName?: string) => Promise<UserProfile>;
  createUserProfile: (userId: string, displayName?: string) => Promise<void>;
  updateUserAvatar: (userId: string, avatarUrl: string) => Promise<void>;
  updateUserNickname: (userId: string, nickname: string) => Promise<void>;
  clearSupabaseProfile: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  supabaseProfile: null,
  loading: false,
  onboardingCompleted: false,
  fetchSupabaseProfile: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();
    
    if (data) {
      set({ supabaseProfile: data, loading: false, onboardingCompleted: !!data.display_name });
    } else {
      set({ loading: false });
    }
    
    if (error) {
      console.error('Error fetching user profile:', error);
      set({ loading: false });
      // Don't throw - let calling components handle the missing user case
    }
  },
  ensureUserProfile: async (userId, displayName) => {
    // Check if there's already a pending creation for this user
    const existingPromise = userCreationPromises.get(userId);
    if (existingPromise) {
      console.log('User creation already in progress, waiting...');
      return existingPromise;
    }

    // Create a new promise for this user creation
    const userPromise = (async (): Promise<UserProfile> => {
      try {
        // Use service role client for all operations to avoid RLS issues
        const client = supabaseAdmin || supabase;
        
        // First try to fetch the existing profile
        const { data, error } = await client
          .from('users')
          .select('*')
          .eq('clerk_id', userId)
          .single();
        
        if (data) {
          // User exists, update state and return
          set({ supabaseProfile: data, onboardingCompleted: !!data.display_name });
          return data;
        }
        
        if (error && error.code === 'PGRST116') {
          // User doesn't exist, create it
          console.log('User profile not found, creating new profile...');
          const { data: newUser, error: createError } = await client
            .from('users')
            .insert({
              clerk_id: userId,
              display_name: displayName || null,
              avatar_url: null
            })
            .select()
            .single();
          
          if (createError) {
            // If duplicate key error (23505), user was created by another process
            // Try to fetch it again
            if (createError.code === '23505') {
              console.log('User was created by another process, fetching...');
              const { data: existingUser, error: fetchError } = await client
                .from('users')
                .select('*')
                .eq('clerk_id', userId)
                .single();
              
              if (existingUser) {
                set({ supabaseProfile: existingUser, onboardingCompleted: !!existingUser.display_name });
                return existingUser;
              }
              
              if (fetchError) {
                console.error('Error fetching user after duplicate key error:', fetchError);
                throw fetchError;
              }
            }
            
            console.error('Error creating user profile:', createError);
            throw createError;
          }
          
          if (newUser) {
            set({ supabaseProfile: newUser, onboardingCompleted: !!newUser.display_name });
            console.log('User profile created successfully:', newUser);
            return newUser;
          }
        }
        
        // If we get here, something unexpected happened
        throw error || new Error('Failed to ensure user profile');
      } catch (error) {
        console.error('Error in ensureUserProfile:', error);
        throw error;
      } finally {
        // Always clean up the promise from cache
        userCreationPromises.delete(userId);
      }
    })();

    // Store the promise in cache
    userCreationPromises.set(userId, userPromise);
    
    return userPromise;
  },
  createUserProfile: async (userId, displayName) => {
    try {
      // Use service role client to create user profile
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('users')
        .insert({
          clerk_id: userId,
          display_name: displayName || null,
          avatar_url: null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
      
      if (data) {
        set({ supabaseProfile: data, onboardingCompleted: !!data.display_name });
        console.log('User profile created successfully:', data);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  },
  updateUserAvatar: async (userId, avatarUrl) => {
    // Use service role client to bypass RLS for user profile updates
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('clerk_id', userId)
      .select();
    if (data) {
      set({ supabaseProfile: data[0] });
    }
    if (error) {
      console.error('Error updating avatar:', error);
    }
  },
  updateUserNickname: async (userId, nickname) => {
    // Use service role client to bypass RLS for user profile updates
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('users')
      .update({ display_name: nickname })
      .eq('clerk_id', userId)
      .select();
    if (data) {
      set({ supabaseProfile: data[0], onboardingCompleted: true });
    }
    if (error) {
      console.error('Error updating nickname:', error);
    }
  },
  clearSupabaseProfile: () => set({ supabaseProfile: null, onboardingCompleted: false }),
  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
}));
