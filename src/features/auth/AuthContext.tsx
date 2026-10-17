import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile, University } from '../../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { safeStorage } from '../../lib/storage';

const LAUNCH_CAMPUS_ID = 'e5b7c844-3c66-41f2-95f3-7033cb21a4f1';

export const LAUNCH_CAMPUS: University = {
  id: LAUNCH_CAMPUS_ID,
  name: 'The Co-operative University of Kenya',
  shortCode: 'CUK',
  county: 'Nairobi',
  allowedEmailDomains: ['cuk.ac.ke', 'student.cuk.ac.ke'],
  isActive: true,
};

interface AuthContextType {
  profile: Profile | null;
  campus: University;
  authReady: boolean;
  authError: string | null;
  authUserId: string | null;
  isAuthenticated: boolean;
  setProfile: (profile: Profile | null) => Promise<void>;
  signOut: () => Promise<void>;
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toProfile(row: {
  id: string;
  university_id: string;
  handle: string;
  avatar_style: string;
  role: Profile['role'];
  created_at: string;
  banned_at: string | null;
}): Profile {
  return {
    id: row.id,
    universityId: row.university_id,
    handle: row.handle,
    avatarStyle: row.avatar_style,
    role: row.role,
    createdAt: row.created_at,
    bannedAt: row.banned_at,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined' && !safeStorage.removeItem('quadanon.profile')) {
      console.error('Unable to clear the legacy locally stored profile.');
    }

    const bootstrapAuth = async () => {
      if (!isSupabaseConfigured) {
        setAuthError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.');
        setAuthReady(true);
        return;
      }

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        let session = sessionData.session;
        if (!session) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          session = data.session;
        }
        if (!session) {
          throw new Error('Supabase did not return an authenticated session.');
        }

        const { data: profileRow, error: profileError } = await supabase
          .from('profiles')
          .select('id, university_id, handle, avatar_style, role, created_at, banned_at')
          .eq('id', session.user.id)
          .maybeSingle();
        if (profileError) throw profileError;

        if (!isMounted) return;
        setAuthUserId(session.user.id);
        setProfileState(profileRow ? toProfile(profileRow) : null);
      } catch (error) {
        console.error('Unable to initialize Supabase authentication.', error);
        if (isMounted) {
          setAuthError(
            error instanceof Error
              ? error.message
              : 'Authentication could not be initialized. Please try again.'
          );
        }
      } finally {
        if (isMounted) setAuthReady(true);
      }
    };

    void bootstrapAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const ensureAuthenticated = async (): Promise<string> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.');
    }

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) {
      setAuthUserId(data.session.user.id);
      return data.session.user.id;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) throw signInError;
    if (!signInData.user) throw new Error('Supabase did not return an authenticated user.');
    setAuthUserId(signInData.user.id);
    return signInData.user.id;
  };

  const setProfile = async (nextProfile: Profile | null) => {
    if (nextProfile === null) {
      setProfileState(null);
      return;
    }

    const userId = await ensureAuthenticated();
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          university_id: nextProfile.universityId,
          handle: nextProfile.handle,
          avatar_style: nextProfile.avatarStyle,
        },
        { onConflict: 'id' }
      )
      .select('id, university_id, handle, avatar_style, role, created_at, banned_at')
      .single();

    if (error) throw error;
    setAuthUserId(userId);
    setProfileState(toProfile(data));
    setAuthError(null);
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setProfileState(null);
    setAuthUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        campus: LAUNCH_CAMPUS,
        authReady,
        authError,
        authUserId,
        isAuthenticated: !!profile,
        setProfile,
        signOut,
        activeModal,
        openModal: (modalId) => setActiveModal(modalId),
        closeModal: () => setActiveModal(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
