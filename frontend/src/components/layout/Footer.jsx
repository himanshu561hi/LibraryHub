import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { footerQuickLinks, footerSupportLinks } from '../../data/navigation';
import { siteConfig } from '../../data/siteConfig';
import { libraryImages } from '../../data/images';
import libraryHubBg from '../../assets/images/library-hub-formulas-hd.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // White text shadow halo for maximum readability over formula backgrounds without any white card
  const textHaloStyle = {
    textShadow: '0 1px 2px #ffffff, 0 0 6px #ffffff, 0 0 10px #ffffff',
  };

  return (
    <footer className="relative bg-white border-t border-brand-surface-border mt-auto overflow-hidden text-brand-navy-950">
      {/* High-Resolution Background from LIBRARY HUB (1) with tuned subtle opacity */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${libraryHubBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: 0.12,
        }}
        aria-hidden="true"
      />

      {/* Upper Footer: Notice Bar */}
      <div className="relative z-10 border-b border-brand-surface-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-navy-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-extrabold text-brand-navy-950" style={textHaloStyle}>
              Admissions & Visit Inquiries Open
            </span>
          </div>
          <div className="flex items-center gap-4 text-brand-gold-800 font-extrabold" style={textHaloStyle}>
            <span>{siteConfig.tagline}</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Seamless without any white background box */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Brand & Positioning (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-500 rounded-lg"
              title="Library Hub Nawalpur"
            >
              <img
                src={libraryImages.logo.src}
                alt="Library Hub Logo"
                className="h-8 xs:h-9 sm:h-10 md:h-[42px] w-auto max-w-[200px] sm:max-w-[240px] object-contain mix-blend-multiply transition-transform group-hover:scale-105"
              />
              <span className="text-[10px] font-bold text-brand-gold-800 bg-brand-gold-50 px-2 py-0.5 rounded border border-brand-gold-200 tracking-wider uppercase shrink-0 shadow-soft-sm">
                Nawalpur
              </span>
            </Link>

            <p
              className="text-sm text-brand-navy-900 max-w-sm leading-relaxed font-bold"
              style={textHaloStyle}
            >
              A calm, comfortable, and disciplined self-study environment tailored for competitive exam aspirants, college students, and dedicated readers in Nawalpur.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-brand-navy-900 border border-brand-surface-border bg-white/60 shadow-soft-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold-600" />
                <span style={textHaloStyle}>Zero Distractions · Quiet Zone Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3
              className="text-xs font-extrabold uppercase tracking-wider text-brand-navy-950"
              style={textHaloStyle}
            >
              Explore
            </h3>
            <ul className="space-y-2 text-sm font-bold">
              {footerQuickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-brand-navy-800 hover:text-brand-navy-950 transition-colors inline-flex items-center gap-1 group"
                    style={textHaloStyle}
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Information & Rules (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3
              className="text-xs font-extrabold uppercase tracking-wider text-brand-navy-950"
              style={textHaloStyle}
            >
              Information
            </h3>
            <ul className="space-y-2 text-sm font-bold">
              {footerSupportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-brand-navy-800 hover:text-brand-navy-950 transition-colors inline-flex items-center gap-1 group"
                    style={textHaloStyle}
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Location & Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3
              className="text-xs font-extrabold uppercase tracking-wider text-brand-navy-950"
              style={textHaloStyle}
            >
              Location & Contact
            </h3>
            <div className="space-y-3 text-sm text-brand-navy-900">
              <a
                href={siteConfig.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 group hover:text-brand-navy-950 transition-colors"
                title="View on Google Maps"
              >
                <MapPin className="w-4 h-4 text-brand-gold-600 mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs leading-relaxed font-bold" style={textHaloStyle}>
                  {siteConfig.address}
                </span>
              </a>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-gold-600 shrink-0" />
                <span className="text-xs text-brand-navy-800 font-bold" style={textHaloStyle}>
                  {siteConfig.hours}
                </span>
              </div>
              <a
                href={siteConfig.phoneTel}
                className="flex items-center gap-2.5 hover:text-brand-navy-950 transition-colors group"
              >
                <Phone className="w-4 h-4 text-brand-gold-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-extrabold text-brand-navy-950" style={textHaloStyle}>
                  {siteConfig.phone}
                </span>
              </a>
              <div className="pt-2">
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-soft-sm transition-colors"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-brand-surface-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-navy-800 font-bold">
          <p style={textHaloStyle}>
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/rules" className="hover:text-brand-navy-950 transition-colors" style={textHaloStyle}>
              Library Rules
            </Link>
            <Link to="/faqs" className="hover:text-brand-navy-950 transition-colors" style={textHaloStyle}>
              FAQs
            </Link>
            <Link to="/contact" className="hover:text-brand-navy-950 transition-colors" style={textHaloStyle}>
              Help & Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
