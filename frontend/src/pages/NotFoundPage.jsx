import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-surface-muted flex items-center justify-center text-brand-navy-700 font-heading font-black text-2xl mb-6 border border-brand-surface-border">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-heading font-black text-brand-navy-950 mb-3">
        Page Not Found
      </h1>
      <p className="text-sm sm:text-base text-brand-navy-600 max-w-md mx-auto mb-8">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-navy-900 text-white hover:bg-brand-navy-800 transition-colors shadow-soft"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}

