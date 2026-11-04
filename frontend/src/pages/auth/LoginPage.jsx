import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { libraryImages } from '../../data/images';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, fastDevLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [gsiReady, setGsiReady] = useState(false);
  const googleBtnRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Destination after login
  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/dashboard');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle genuine Google Identity Services credential response
  const handleCredentialResponse = async (response) => {
    if (!response.credential) {
      setErrorMsg('No Google credentials returned. Please try again.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg(res.error || 'Failed to authenticate with Google');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    let intervalId = null;

    const setupGoogleSignIn = () => {
      if (!window.google?.accounts?.id || !googleClientId) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 360,
          });
          setGsiReady(true);
        }
        return true;
      } catch (err) {
        console.warn('Google Identity initialization failed:', err);
        return false;
      }
    };

    if (!setupGoogleSignIn()) {
      intervalId = setInterval(() => {
        if (setupGoogleSignIn()) {
          clearInterval(intervalId);
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [googleClientId]);

  // Fast developer bypass
  const handleTestStudentLogin = async () => {
    setSubmitting(true);
    setErrorMsg('');
    const res = await fastDevLogin('student');
    setSubmitting(false);
    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMsg(res.error || 'Failed to authenticate');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-soft border border-brand-surface-border">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <img
              src={libraryImages.logo.src}
              alt="Library Hub Nawalpur"
              className="h-12 w-auto mx-auto object-contain mix-blend-multiply"
            />
          </Link>
          <h2 className="text-2xl font-bold text-brand-navy-950 tracking-tight">
            Student Member Portal
          </h2>
          <p className="mt-1.5 text-sm text-brand-navy-600">
            Sign in with your Google Account to check daily attendance, view invoices, and manage your membership.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Features highlight */}
        <div className="bg-brand-surface-muted/60 p-4 rounded-xl border border-brand-surface-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mark Daily Attendance (Check IN & OUT)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>View Joining-Date Billing & Payment Receipts</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Track Study Hours and Monthly Consistency</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {submitting && (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-brand-navy-800 font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-brand-gold-600" />
              <span>Signing in to Library Hub...</span>
            </div>
          )}

          {/* Genuine Google Identity Services Button */}
          <div className="flex flex-col items-center justify-center">
            <div
              ref={googleBtnRef}
              id="googleSignInDiv"
              className="w-full flex justify-center min-h-[44px]"
            />
          </div>

          {/* Fallback button if Google script is blocked or in offline dev */}
          {!gsiReady && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleTestStudentLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-brand-navy-200 bg-white hover:bg-brand-surface-muted text-brand-navy-950 font-semibold text-sm transition-all shadow-soft-sm hover:shadow-soft active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {/* Quick Offline Dev Helper Link */}
          {import.meta.env.DEV && gsiReady && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleTestStudentLogin}
                className="text-[11px] text-brand-navy-400 hover:text-brand-navy-600 transition-colors underline"
              >
                Offline Dev 1-Click Demo Login
              </button>
            </div>
          )}
        </div>

        {/* Footer Admin Links */}
        <div className="pt-4 border-t border-brand-surface-border text-center">
          <p className="text-xs text-brand-navy-500">
            Are you a Library Hub Administrator?{' '}
            <Link
              to="/admin/login"
              className="font-bold text-brand-gold-600 hover:text-brand-gold-700 underline underline-offset-2"
            >
              Sign in to Admin Console
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

