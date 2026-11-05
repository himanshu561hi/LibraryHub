import React from 'react';
import {
  MapPin,
  Phone,
  PhoneCall,
  MessageCircle,
  Instagram,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import Button from '../components/common/Button';
import { siteConfig } from '../data/siteConfig';

export default function ContactPage() {
  return (
    <div className="flex-1 py-8 sm:py-10 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb & Hero */}
        <section className="space-y-6">
          <Breadcrumb items={[{ label: 'Contact & Location' }]} />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-300 shadow-soft-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Direct Admissions & Visit Guidance</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-brand-navy-950 tracking-tight leading-tight">
              Connect Directly with Library Hub Nawalpur
            </h1>

            <p className="text-base sm:text-lg text-brand-navy-700 leading-relaxed font-medium">
              No online forms or waiting for email replies. Call us directly, chat on WhatsApp for instant seat updates, locate us on Google Maps, or follow our updates on Instagram.
            </p>
          </div>
        </section>

        {/* 1. PRIMARY CONTACT CHANNELS (DIRECT CALL & WHATSAPP) */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-600 block mb-1">
              Instant Communication
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-navy-950">
              Direct Call or WhatsApp
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            
            {/* Direct Phone Call Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-brand-surface-card border-2 border-brand-navy-900/10 hover:border-brand-navy-900/30 hover:-translate-y-1 transition-all duration-300 shadow-soft hover:shadow-soft-lg flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-navy-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-soft-sm">
                    <PhoneCall className="w-6 h-6 text-brand-gold-400" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-navy-50 text-brand-navy-900 border border-brand-navy-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Available 6 AM – 10 PM
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-navy-500 block mb-1">
                    Phone Call Support
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-brand-navy-950">
                    {siteConfig.phone}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-brand-navy-700 leading-relaxed">
                  Call our administrator directly for immediate guidance on seat vacancies, day/night shift timings, monthly fees (₹500, ₹600, ₹800), and same-day desk reservation.
                </p>

                <div className="pt-2 border-t border-brand-surface-border space-y-2 text-xs text-brand-navy-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant verbal confirmation of seat availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct conversation with on-site library management</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-brand-surface-border">
                <a
                  href={siteConfig.phoneTel}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold bg-brand-navy-900 text-white hover:bg-brand-navy-800 active:scale-[0.98] transition-all shadow-soft group-hover:shadow-soft-md"
                >
                  <Phone className="w-4 h-4 text-brand-gold-400" />
                  <span>Call {siteConfig.phone} Now</span>
                </a>
              </div>
            </div>

            {/* Direct WhatsApp Chat Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-950 text-white border-2 border-emerald-500/40 hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 shadow-soft hover:shadow-soft-lg flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-soft-sm">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Instant WhatsApp Replies
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    WhatsApp Chat
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                    Chat on WhatsApp
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Prefer texting? Tap below to send a pre-filled WhatsApp message. Inquire about shift timings, get photos of cabins, or ask any question anytime.
                </p>

                <div className="pt-2 border-t border-emerald-800/80 space-y-2 text-xs text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Quick responses for seat reservations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Request library reading hall photos directly on chat</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-emerald-800/80">
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-soft group-hover:shadow-soft-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Chat Directly</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 2. GOOGLE MAPS & INSTAGRAM SECTION */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-600 block mb-1">
              Location & Social
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-navy-950">
              Visit Us & Follow Our Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Google Maps Location Card (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-brand-surface-card border border-brand-surface-border shadow-soft flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold-700">
                    <MapPin className="w-4 h-4 text-brand-gold-600" />
                    Google Maps Verified Location
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Verified Listing
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-brand-surface-muted border border-brand-surface-border space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-brand-navy-950 text-brand-gold-400 flex items-center justify-center shrink-0 shadow-soft-sm">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-lg text-brand-navy-950">
                        {siteConfig.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-brand-navy-800 mt-1 leading-relaxed font-medium">
                        {siteConfig.address}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold-800 bg-brand-gold-50 px-2.5 py-1 rounded border border-brand-gold-200">
                        <span>Landmark: Opposite Kali Mandir</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-brand-navy-700 pt-1">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Prime Roadside Access:</strong> Situated directly on Main Road, Nawalpur with zero confusing alleyways.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Parking Available:</strong> Dedicated and safe two-wheeler parking available right in front of the building.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-surface-border flex flex-col sm:flex-row gap-3">
                <a
                  href={siteConfig.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-brand-navy-900 text-white hover:bg-brand-navy-800 transition-colors shadow-soft"
                >
                  <Navigation className="w-4 h-4 text-brand-gold-400" />
                  <span>Open in Google Maps App</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <a
                  href={siteConfig.phoneTel}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-brand-surface border border-brand-surface-border text-brand-navy-900 hover:bg-brand-surface-muted transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-gold-600" />
                  <span>Call for Directions</span>
                </a>
              </div>
            </div>

            {/* Instagram Card & Visit Guidelines (5 cols) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col">
              
              {/* Instagram Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/15 border border-pink-200 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-soft-sm">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-pink-900 border border-pink-200">
                    Official Instagram
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-700 block mb-1">
                    Connect On Social Media
                  </span>
                  <h3 className="text-xl sm:text-2xl font-heading font-black text-brand-navy-950">
                    {siteConfig.instagramHandle}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-brand-navy-700 leading-relaxed font-medium">
                  Follow us on Instagram for daily library atmosphere, study motivation, topper routines, seat vacancy notifications, and announcements.
                </p>

                <div className="pt-2">
                  <a
                    href={siteConfig.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-95 active:scale-[0.98] transition-all shadow-soft"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Follow {siteConfig.instagramHandle}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>

              {/* Walk-in Visit Hours Card */}
              <div className="p-6 rounded-2xl bg-brand-navy-950 text-white space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-brand-gold-400 font-bold text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Walk-In Desk Tour & Visit Hours</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-navy-200 leading-relaxed">
                    Interested students and parents are welcome to visit any day between <strong className="text-white">8:00 AM and 8:00 PM</strong>. Inspect our ergonomic cabins, test the Wi-Fi speed, and select your desk on the spot.
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-navy-800 flex items-center justify-between text-xs text-brand-navy-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-gold-400" />
                    Open 24 Hours (All 7 Days · Day & Night Shifts)
                  </span>
                  <span className="text-brand-gold-300 font-bold">Free Walk-In</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3. TRANSPARENCY & ZERO REGISTRATION FEE NOTICE */}
        <section className="p-6 sm:p-8 rounded-2xl bg-brand-surface-card border border-brand-surface-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-lg font-heading font-extrabold text-brand-navy-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Direct In-Person Admission · Zero Hidden Fees</span>
            </h3>
            <p className="text-xs sm:text-sm text-brand-navy-600 leading-relaxed">
              Admissions are conducted transparently in-person at our reception desk. We never ask for online payments or third-party booking fees. Simply call, message on WhatsApp, or visit us in Nawalpur!
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
            <a
              href={siteConfig.phoneTel}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-navy-900 text-white hover:bg-brand-navy-800 transition-colors shadow-soft"
            >
              <Phone className="w-3.5 h-3.5 text-brand-gold-400" />
              <span>Call Us</span>
            </a>
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-soft"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
