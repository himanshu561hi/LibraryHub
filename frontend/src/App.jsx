import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FacilitiesPage from './pages/FacilitiesPage';
import MembershipPage from './pages/MembershipPage';
import GalleryPage from './pages/GalleryPage';
import RulesPage from './pages/RulesPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Portal & Dashboard Pages
import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Brand Pages */}
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="faqs" element={<FaqPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Authentication Pages */}
            <Route path="login" element={<LoginPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />

            {/* Student Protected Portal */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'super_admin']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Console */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
