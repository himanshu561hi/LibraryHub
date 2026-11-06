import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
        }, 300);
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
    <div className="relative group overflow-hidden rounded-2xl flex flex-col items-center justify-center">
      <img
        src={popup.imageUrl}
        alt={popup.title || 'Library Hub Special Announcement'}
        className="w-auto h-auto max-w-[92vw] sm:max-w-[85vw] md:max-w-[720px] max-h-[82vh] object-contain block mx-auto rounded-2xl select-none"
      />
      {popup.title && (
        <div className="w-full bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 sm:p-4 absolute bottom-0 inset-x-0 text-white text-center">
          <p className="font-bold text-xs sm:text-sm drop-shadow">{popup.title}</p>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4"
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
          className="fixed inset-0 bg-brand-navy-950/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window Container — Fully responsive & shrink-wrapped to image natural dimensions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative z-10 inline-block max-w-[94vw] sm:max-w-[88vw] max-h-[86vh] mx-auto"
        >
          {/* Close button firmly positioned at top-right corner of banner */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-brand-navy-950 hover:bg-brand-gold-500 hover:text-white transition-all shadow-2xl flex items-center justify-center border-2 border-brand-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-500"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          {/* Graphic Link / Container without fixed width */}
          <div className="bg-white p-1 sm:p-1.5 rounded-2xl shadow-2xl border border-white/30 flex items-center justify-center">
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
