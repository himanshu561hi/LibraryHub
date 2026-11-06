import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'library_top_banner_dismissed';

export default function TopAnnouncementBar({ banner }) {
  const location = useLocation();
  const [isDismissed, setIsDismissed] = useState(true);

  // Determine if current route should display the banner
  const isEligiblePage =
    location.pathname === '/' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/';

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      setIsDismissed(dismissed === 'true');
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      // Ignore storage errors in private browsing
    }
  };

  if (!isEligiblePage || !banner || !banner.enabled || !banner.text?.trim() || isDismissed) {
    return null;
  }

  const isExternalLink = banner.linkUrl?.startsWith('http://') || banner.linkUrl?.startsWith('https://');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-50 bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white border-b border-amber-800/40 shadow-sm"
        role="region"
        aria-label="Site Announcement"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Announcement content */}
          <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap leading-tight font-medium tracking-wide">
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0">
              <Sparkles className="w-3 h-3 text-amber-200 animate-pulse" />
              Notice
            </span>
            <span className="font-semibold">{banner.text}</span>

            {banner.linkText && banner.linkUrl && (
              isExternalLink ? (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-2 font-bold hover:text-amber-100 transition-colors ml-1"
                >
                  {banner.linkText}
                  <ArrowRight className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  to={banner.linkUrl}
                  className="inline-flex items-center gap-1 underline underline-offset-2 font-bold hover:text-amber-100 transition-colors ml-1"
                >
                  {banner.linkText}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )
            )}
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="p-1 rounded-md hover:bg-white/20 active:bg-white/30 text-white/90 hover:text-white transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

