import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Phone,
  Camera,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { primaryNavLinks, moreNavLinks, allNavLinks } from '../../data/navigation';
import { siteConfig } from '../../data/siteConfig';
import { libraryImages } from '../../data/images';
import libraryHubBg from '../../assets/images/library-hub-formulas-hd.png';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside click to close "More" dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Track scroll position for elevated header style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Check if any of the "More" items is currently active
  const isMoreActive = moreNavLinks.some((item) => location.pathname === item.path);

  // Icon mapping for More items
  const moreIcons = {
    '/gallery': Camera,
    '/rules': ShieldCheck,
    '/faqs': HelpCircle,
  };

  return (
    <header
      className={`sticky top-0 z-50 relative transition-all duration-200 border-b border-brand-surface-border ${
        scrolled
          ? 'shadow-soft backdrop-blur-md'
          : 'shadow-soft-sm'
      }`}
    >
      {/* High-Resolution Background from LIBRARY HUB (1) with subtle watermark opacity */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          backgroundImage: `url(${libraryHubBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: 0.20,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-500 rounded-lg shrink-0"
            title="Library Hub Nawalpur"
          >
            <img
              src={libraryImages.logo.src}
              alt="Library Hub Nawalpur"
              className="h-8 xs:h-9 sm:h-10 md:h-[42px] w-auto max-w-[180px] xs:max-w-[210px] sm:max-w-[250px] md:max-w-[280px] object-contain mix-blend-multiply transition-transform group-hover:scale-105"
            />
            <span className="hidden sm:inline-block text-[10px] font-bold text-brand-gold-700 bg-brand-gold-50 px-2 py-0.5 rounded border border-brand-gold-200 tracking-wider uppercase shrink-0">
              Nawalpur
            </span>
          </Link>

          {/* Desktop Streamlined Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-brand-surface-muted/80 border border-brand-surface-border"
            aria-label="Main Navigation"
          >
            {primaryNavLinks.slice(0, 4).map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-brand-navy-950 bg-white shadow-soft-sm font-bold'
                      : 'text-brand-navy-700 hover:text-brand-navy-950 hover:bg-white/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* "More" Dropdown Menu (Gallery, Rules, FAQs) */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setMoreDropdownOpen(true)}
              onMouseLeave={() => setMoreDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-500 ${
                  isMoreActive || moreDropdownOpen
                    ? 'text-brand-navy-950 bg-white shadow-soft-sm font-bold'
                    : 'text-brand-navy-700 hover:text-brand-navy-950 hover:bg-white/60'
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    moreDropdownOpen ? 'rotate-180 text-brand-navy-950' : 'text-brand-navy-600'
                  }`}
                />
              </button>

              {/* Dropdown Popover */}
              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-white border border-brand-surface-border shadow-2xl p-2 z-[100]"
                  >
                    <div className="space-y-1">
                      {moreNavLinks.map((item) => {
                        const Icon = moreIcons[item.path] || ArrowRight;
                        const isActive = location.pathname === item.path;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-brand-surface-muted text-brand-navy-950 font-semibold'
                                : 'hover:bg-brand-surface-muted text-brand-navy-800'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-brand-surface-muted flex items-center justify-center text-brand-navy-700 shrink-0 mt-0.5 border border-brand-surface-border">
                              <Icon className="w-4 h-4 text-brand-gold-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold leading-tight">
                                {item.name}
                              </span>
                              <span className="text-[11px] text-brand-navy-500 leading-tight mt-0.5">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact Link */}
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-brand-navy-950 bg-white shadow-soft font-bold'
                    : 'text-brand-navy-800 hover:text-brand-navy-950 hover:bg-white/80'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Desktop Right CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-soft-sm hover:shadow-soft border ${
                    location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')
                      ? 'bg-brand-navy-950 text-white border-brand-navy-950'
                      : 'bg-white hover:bg-brand-surface-muted text-brand-navy-950 border-brand-surface-border'
                  }`}
                  title={user?.name || (isAdmin ? 'Admin Console' : 'Student Portal')}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isAdmin ? 'bg-brand-gold-500 text-brand-navy-950' : 'bg-brand-navy-900 text-white'
                    }`}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : (isAdmin ? 'A' : 'S')}
                  </div>
                  <span>{isAdmin ? 'Admin Console' : 'My Portal'}</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-navy-800 hover:text-brand-navy-950 hover:bg-white/80 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand-gold-600" />
                  <span>Student Login</span>
                </Link>

                <Link
                  to="/membership"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-navy-900 text-white hover:bg-brand-navy-800 active:scale-[0.98] transition-all shadow-soft-sm hover:shadow-soft"
                >
                  <span>Explore Membership</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold-400" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-navy-800 hover:bg-brand-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-gold-500 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 sm:top-[68px] z-40 lg:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-brand-navy-950/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer content */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative bg-brand-surface border-b border-brand-surface-border shadow-soft-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto px-5 sm:px-6 py-6"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy-500 px-3 py-1">
                  Menu Navigation
                </span>

                {allNavLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-navy-900 text-white font-semibold shadow-soft-sm'
                          : 'text-brand-navy-800 hover:bg-brand-surface-muted hover:text-brand-navy-950'
                      }`
                    }
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                ))}

                {/* Mobile Direct Action Buttons */}
                <div className="pt-4 mt-2 border-t border-brand-surface-border flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={siteConfig.phoneTel}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-brand-surface-card border border-brand-surface-border text-brand-navy-900 hover:bg-brand-surface-muted transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-gold-600 shrink-0" />
                      <span>Call Us</span>
                    </a>
                    <a
                      href={siteConfig.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-soft-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <Link
                    to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-brand-surface-muted text-brand-navy-950 border border-brand-surface-border transition-colors shadow-soft-sm"
                  >
                    <User className="w-4 h-4 text-brand-gold-600" />
                    <span>{isAuthenticated ? (isAdmin ? 'Admin Console' : 'My Student Portal') : 'Student Member Login'}</span>
                  </Link>

                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out ({user?.name || 'Account'})</span>
                    </button>
                  )}

                  {!isAdmin && (
                    <Link
                      to="/membership"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-brand-navy-900 text-white hover:bg-brand-navy-800 transition-colors shadow-soft"
                    >
                      <span>Explore Membership Plans</span>
                      <ArrowRight className="w-4 h-4 text-brand-gold-400" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
