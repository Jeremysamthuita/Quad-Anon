import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ProfileModal } from '../features/auth/ProfileModal';

// Code-split routes with React.lazy
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

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingState label="Loading campus view..." />}>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Default Landing Page: Redirects to /whispers */}
              <Route path="/" element={<Navigate to="/whispers" replace />} />
              <Route path="/whispers" element={<WhispersFeed />} />
              <Route path="/quad" element={<QuadFeed />} />
              <Route path="/dms" element={<ShadowDMsPage />} />
              <Route path="/dms/:conversationId" element={<ShadowDMsPage />} />
              <Route path="/radar" element={<RadarDashboard />} />
              <Route path="/library" element={<LibraryCatalog />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
        {/* Global Modals */}
        <ProfileModal />
      </ErrorBoundary>
    </BrowserRouter>
  );
};
