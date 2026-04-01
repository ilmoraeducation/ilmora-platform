// src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BrochureGenerator = lazy(() => import('./pages/BrochureGenerator'));
const PosterGenerator = lazy(() => import('./pages/PosterGenerator'));

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <img src="/images/logo/ilmora-white.png" alt="ILMORA" />
        <div className="loading-bar">
          <div className="loading-bar-fill"></div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin, isStudent } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/student" />;
  return children;
}

function PublicRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  if (currentUser) {
    return <Navigate to={isAdmin ? '/admin' : '/student'} />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/student/*" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/brochure" element={<BrochureGenerator />} />
        <Route path="/poster" element={<PosterGenerator />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '12px',
              fontFamily: 'Montserrat, sans-serif'
            },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#000' } },
            error: { iconTheme: { primary: '#ff4444', secondary: '#000' } }
          }}
        />
      </AuthProvider>
    </Router>
  );
}
