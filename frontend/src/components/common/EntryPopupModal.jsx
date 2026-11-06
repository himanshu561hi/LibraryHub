import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'library_entry_popup_dismissed';

export default function EntryPopupModal({ popup }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!popup || !popup.enabled || !popup.imageUrl?.trim()) {
      setIsOpen(false);
      return;
    }

    try {
      const alreadyDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!alreadyDismissed) {
        // Small delay so site finishes initial paint smoothly
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, [popup]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore sessionStorage issues
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !popup?.enabled || !popup?.imageUrl?.trim()) {
    return null;
  }

  const isExternal =
    popup.actionUrl?.startsWith('http://') || popup.actionUrl?.startsWith('https://');

  const GraphicContent = (
    <div className="relative group overflow-hidden rounded-2xl bg-brand-surface-card max-h-[80vh] flex flex-col items-center justify-center">
      <img
        src={popup.imageUrl}
        alt={popup.title || 'Library Hub Special Announcement'}
        className="w-full h-auto max-h-[75vh] object-contain sm:object-cover rounded-2xl select-none"
      />
      {popup.title && (
        <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 absolute bottom-0 inset-x-0 text-white text-center">
          <p className="font-bold text-sm sm:text-base drop-shadow-md">{popup.title}</p>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={popup.title || 'Special Announcement'}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 bg-brand-navy-950/75 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative z-10 w-full max-w-lg sm:max-w-xl mx-auto"
        >
          {/* Close button at top-right floating over or above modal */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            className="absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-brand-navy-900 hover:bg-brand-gold-500 hover:text-white transition-all shadow-xl flex items-center justify-center border-2 border-brand-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-500"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Graphic Link / Wrapper */}
          <div className="bg-white rounded-2xl p-1.5 sm:p-2 shadow-2xl border border-white/20">
            {popup.actionUrl?.trim() ? (
              isExternal ? (
                <a
                  href={popup.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="block cursor-pointer focus-visible:outline-none"
                >
                  {GraphicContent}
                </a>
              ) : (
                <Link
                  to={popup.actionUrl}
                  onClick={handleClose}
                  className="block cursor-pointer focus-visible:outline-none"
                >
                  {GraphicContent}
                </Link>
              )
            ) : (
              <div>{GraphicContent}</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
