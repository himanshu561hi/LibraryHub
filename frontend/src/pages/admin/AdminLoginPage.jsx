import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { libraryImages } from '../../data/images';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAsAdmin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await loginAsAdmin(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.error || 'Invalid administrator credentials');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-soft border border-brand-navy-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-navy-950 text-brand-gold-400 flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy-950 tracking-tight">
            Administrator Console
          </h2>
          <p className="mt-1 text-sm text-brand-navy-600">
            Sign in with authorized staff credentials to manage members, attendance, and finances.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-navy-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@libraryhub.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-surface-border text-sm text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-navy-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-surface-border text-sm text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-navy-400 hover:text-brand-navy-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-navy-950 hover:bg-brand-navy-900 text-white font-semibold text-sm transition-all shadow-soft active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-gold-400" />
            ) : (
              <>
                <span>Sign in as Admin</span>
                <ArrowRight className="w-4 h-4 text-brand-gold-400" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-brand-surface-border text-center">
          <Link
            to="/login"
            className="text-xs font-medium text-brand-navy-500 hover:text-brand-navy-700"
          >
            ← Back to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}

