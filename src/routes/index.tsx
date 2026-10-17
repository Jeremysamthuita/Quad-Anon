import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ProfileModal } from '../features/auth/ProfileModal';
import { CreateProfilePage } from '../features/auth/CreateProfilePage';
import { DeleteAccountPage } from '../features/auth/DeleteAccountPage';
import { useAuth } from '../features/auth/AuthContext';
import { LandingPage } from './LandingPage';

const WhispersFeed = lazy(() =>
  import('../features/whispers/WhispersFeed').then((m) => ({ default: m.WhispersFeed }))
);
const QuadFeed = lazy(() =>
  import('../features/quad/QuadFeed').then((m) => ({ default: m.QuadFeed }))
);
const ShadowDMsPage = lazy(() =>
  import('../features/dms/ShadowDMsPage').then((m) => ({ default: m.ShadowDMsPage }))
);
const RadarDashboard = lazy(() =>
  import('../features/radar/RadarDashboard').then((m) => ({ default: m.RadarDashboard }))
);
const LibraryCatalog = lazy(() =>
  import('../features/library/LibraryCatalog').then((m) => ({ default: m.LibraryCatalog }))
);
const PrivacyPage = lazy(() =>
  import('../routes/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const AdminDashboard = lazy(() =>
  import('../features/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const NotFoundPage = lazy(() =>
  import('../routes/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, authReady } = useAuth();
  if (!authReady) return <LoadingState label="Restoring your profile..." />;
  return profile ? <>{children}</> : <Navigate to="/create-profile" replace />;
};

const NewProfileRoute: React.FC = () => {
  const { profile, authReady } = useAuth();
  if (!authReady) return <LoadingState label="Restoring your profile..." />;
  return profile ? <Navigate to="/whispers" replace /> : <CreateProfilePage />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingState label="Loading campus view..." />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-profile" element={<NewProfileRoute />} />
            <Route element={<AppLayout />}>
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/whispers" element={<ProtectedRoute><WhispersFeed /></ProtectedRoute>} />
              <Route path="/quad" element={<ProtectedRoute><QuadFeed /></ProtectedRoute>} />
              <Route path="/dms" element={<ProtectedRoute><ShadowDMsPage /></ProtectedRoute>} />
              <Route path="/dms/:conversationId" element={<ProtectedRoute><ShadowDMsPage /></ProtectedRoute>} />
              <Route path="/radar" element={<ProtectedRoute><RadarDashboard /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><LibraryCatalog /></ProtectedRoute>} />
              <Route path="/delete-account" element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
        <ProfileModal />
      </ErrorBoundary>
    </BrowserRouter>
  );
};
