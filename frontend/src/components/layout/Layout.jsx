import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';
import TopAnnouncementBar from '../common/TopAnnouncementBar';
import EntryPopupModal from '../common/EntryPopupModal';
import client from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export default function Layout() {
  const location = useLocation();
  const [announcements, setAnnouncements] = useState({
    popup: null,
    topBanner: null,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await client.get(API_ENDPOINTS.PUBLIC.ANNOUNCEMENTS);
        if (isMounted && res && res.success && res.data) {
          setAnnouncements({
            popup: res.data.popup,
            topBanner: res.data.topBanner,
          });
        }
      } catch (err) {
        // Fallback silently if public endpoint is unavailable
        console.warn('Could not fetch announcements:', err.message);
      }
    };

    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-navy-950 font-sans selection:bg-brand-gold-200 selection:text-brand-navy-900">
      <ScrollToTop />
      
      {/* Top Thin Notification Banner (for Home '/' and Student Dashboard '/dashboard') */}
      <TopAnnouncementBar banner={announcements.topBanner} />

      {/* Main Navigation Header */}
      <Header />

      {/* Global Entry Promotional Popup Modal */}
      <EntryPopupModal popup={announcements.popup} />
      
      <main className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-grow flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
