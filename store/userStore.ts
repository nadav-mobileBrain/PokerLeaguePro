
import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/types/database';

interface UserState {
  supabaseProfile: UserProfile | null;
  loading: boolean;
  onboardingCompleted: boolean;
  fetchSupabaseProfile: (userId: string) => Promise<void>;
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
    }
  },
  updateUserAvatar: async (userId, avatarUrl) => {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
