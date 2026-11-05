import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-brand-navy-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold-600 mb-3" />
        <p className="text-sm font-medium text-brand-navy-600">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If attempting to access an admin route, redirect to /admin/login; otherwise student login /login
    const target = location.pathname.startsWith('/admin')
      ? '/admin/login'
      : '/login';
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl shadow-soft border border-red-200 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-brand-navy-950 mb-2">Access Restricted</h2>
        <p className="text-sm text-brand-navy-600 mb-6">
          Your account role ({user.role}) does not have permission to view this section.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-navy-900 text-white hover:bg-brand-navy-800 transition-colors"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return children;
}

