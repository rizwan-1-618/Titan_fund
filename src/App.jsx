import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Spinner from '@/components/Spinner';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

// ─── React.lazy: Code-split Dashboard and Admin pages ─────────────
// These will be loaded as separate chunks, improving initial load time
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));

/**
 * Suspense fallback component — shown while lazy-loaded pages are loading
 */
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    </div>
  );
}

/**
 * App — root component with routing configuration.
 *
 * Demonstrates:
 *  - React.lazy + Suspense for code splitting
 *  - Context providers wrapping the entire app
 *  - Protected and admin-only routes
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PortfolioProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Protected: Investor Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected + Admin only: Admin Panel */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PortfolioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
