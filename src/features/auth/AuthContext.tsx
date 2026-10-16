import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile, University } from '../../types';

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
  // Production auth will connect to Supabase Auth in Phase 3.
  // For Phase 1, start with a clean pseudonymous student session on the launch campus.
  const [profile, setProfile] = useState<Profile | null>({
    id: 'anon-local-session',
    universityId: LAUNCH_CAMPUS.id,
    handle: 'CampusStudent',
    avatarStyle: 'phantom_ghostling',
    role: 'student',
    createdAt: new Date().toISOString(),
    bannedAt: null,
  });

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
