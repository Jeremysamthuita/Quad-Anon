import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile, University } from '../../types';
import { safeStorage } from '../../lib/storage';

const PROFILE_STORAGE_KEY = 'quadanon.profile';

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<Profile>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.universityId === 'string' &&
    typeof profile.handle === 'string' &&
    typeof profile.avatarStyle === 'string' &&
    (profile.role === 'student' || profile.role === 'moderator' || profile.role === 'admin') &&
    typeof profile.createdAt === 'string' &&
    (typeof profile.bannedAt === 'string' || profile.bannedAt === null)
  );
}

export const LAUNCH_CAMPUS: University = {
  id: 'cuk-main',
  name: 'The Co-operative University of Kenya',
  shortCode: 'CUK',
  county: 'Nairobi',
  allowedEmailDomains: ['cuk.ac.ke', 'student.cuk.ac.ke'],
  isActive: true,
};

interface AuthContextType {
  profile: Profile | null;
  campus: University;
  isAuthenticated: boolean;
  setProfile: (profile: Profile | null) => void;
  signOut: () => void;
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<Profile | null>(() => {
    const savedProfile = safeStorage.getItem<unknown>(PROFILE_STORAGE_KEY, null);
    if (isProfile(savedProfile)) return savedProfile;
    if (savedProfile !== null) safeStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  });

  const setProfile = (nextProfile: Profile | null) => {
    const persisted = nextProfile
      ? safeStorage.setItem(PROFILE_STORAGE_KEY, nextProfile)
      : safeStorage.removeItem(PROFILE_STORAGE_KEY);
    if (!persisted) {
      console.error('Unable to save the local QuadAnon profile. Check browser storage settings.');
    }
    setProfileState(nextProfile);
  };

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const signOut = () => {
    setProfile(null);
  };

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        campus: LAUNCH_CAMPUS,
        isAuthenticated: !!profile,
        setProfile,
        signOut,
        activeModal,
        openModal,
        closeModal,
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
