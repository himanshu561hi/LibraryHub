import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
  Armchair,
  VolumeX,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ChevronRight,
  GraduationCap,
  Target,
  Brain,
  Award,
  Laptop,
  Flame,
  TrendingUp,
  Instagram,
} from 'lucide-react';
import Button from '../components/common/Button';
import SectionHeading from '../components/common/SectionHeading';
import FeatureCard from '../components/common/FeatureCard';
import FacilityCard from '../components/common/FacilityCard';
import PricingCard from '../components/common/PricingCard';
import TestimonialCard from '../components/common/TestimonialCard';
import FaqAccordion from '../components/common/FaqAccordion';
import ImagePlaceholder from '../components/common/ImagePlaceholder';
import { siteConfig } from '../data/siteConfig';
import { facilitiesData } from '../data/facilities';
import { membershipPlans } from '../data/membership';
import { testimonialsData } from '../data/testimonials';
import { faqsData } from '../data/faqs';
import { libraryImages } from '../data/images';

export default function HomePage() {
  // Take first 6 facilities for the homepage preview
  const previewFacilities = facilitiesData.slice(0, 6);
  // Take the 3 membership plans
  const previewPlans = membershipPlans.slice(0, 3);
  // Take first 4 FAQs for preview
  const previewFaqs = faqsData.slice(0, 4);

  // Target competitive examinations in Purvanchal / UP
  const targetExams = [
    { name: 'UPPSC / State PCS', category: 'Civil Services' },
    { name: 'SSC CGL / CHSL / GD', category: 'Staff Selection' },
    { name: 'Banking (IBPS / SBI PO)', category: 'Banking' },
    { name: 'Railway (RRB NTPC)', category: 'Railways' },
    { name: 'UP Police (SI & Constable)', category: 'Police & Defense' },
    { name: 'NEET UG & JEE Main', category: 'Medical & Engineering' },
    { name: 'UP TET / CTET / Super TET', category: 'Teaching' },
    { name: 'College & University Exams', category: 'Academics' },
  ];

  return (
    <div className="flex-1">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-brand-surface pt-8 pb-10 lg:pt-10 lg:pb-14 border-b border-brand-surface-border">
        {/* Subtle geometric academic background pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0F2238_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline and CTAs (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              
              {/* Educational Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-soft-sm">
                <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Target 2025–2026 · Nawalpur's Dedicated Self-Study Sanctuary</span>
              </div>

              {/* Main Headline - 3 Clean Motivating Lines */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-brand-navy-950 tracking-tight leading-[1.08] space-y-1 sm:space-y-1.5">
                <span className="block">Your Space.</span>
                <span className="block">Your Discipline.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-brand-gold-600 to-amber-700">
                  Your Selection.
                </span>
              </h1>

              {/* Student-Centric Subtitle */}
              <p className="text-base sm:text-lg text-brand-navy-800 leading-relaxed max-w-2xl font-medium">
                Built specifically for students and competitive exam aspirants in Nawalpur battling home distractions, power cuts, and irregular study hours. 
                Convert your 2-hour home struggle into <strong className="text-brand-navy-950 font-bold">10+ hours of productive daily focus</strong>.
              </p>

              {/* Exam Target Badges Strip */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy-600 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand-gold-600" />
                  Targeting Aspirants For:
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {targetExams.slice(0, 6).map((exam, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-surface-card border border-brand-surface-border text-brand-navy-900 shadow-soft-sm hover:border-brand-gold-300 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold-500" />
                      {exam.name}
                    </span>
                  ))}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-surface-muted text-brand-navy-600 border border-brand-surface-border text-xs font-medium">
                    + More
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-3">
                <Button
                  to="/membership"
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto shadow-soft"
                >
                  Explore Membership Plans
                </Button>
                <Button
                  to="/contact"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Visit Library & Inquire
                </Button>
              </div>

              {/* Verified Address & Instagram Links */}
              <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                <a
                  href={siteConfig.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-navy-700 hover:text-brand-navy-950 transition-colors group font-medium"
                  title="View location on Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-gold-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{siteConfig.shortAddress}</span>
                  <span className="text-brand-gold-700 font-bold underline underline-offset-2">· View on Map →</span>
                </a>

                <span className="text-brand-surface-border font-bold hidden sm:inline">|</span>

                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-pink-700 hover:text-pink-900 transition-colors font-bold group"
                  title="Follow Library Hub on Instagram"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
                  <span>{siteConfig.instagramHandle}</span>
                </a>
              </div>
            </motion.div>

            {/* Right Column: Hero Study Hall Showcase & Stats (5 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                {/* Decorative background framing */}
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-brand-navy-900/10 via-brand-gold-500/15 to-transparent blur-lg -z-10" />
                
                <div className="relative rounded-card border-2 border-brand-surface-border bg-brand-surface-card p-4 shadow-soft-xl space-y-4">
                  <div className="relative overflow-hidden rounded-lg bg-white border border-brand-surface-border shadow-soft-sm group">
                    <img
                      src={libraryImages.banner.src}
                      alt={libraryImages.banner.alt}
                      className="w-full h-auto object-contain max-h-[380px] mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-navy-950/85 text-brand-gold-300 backdrop-blur-sm border border-white/10 shadow-soft-sm">
                        Official Facilities Banner
                      </span>
                    </div>
                  </div>

                  {/* Study Highlights Card */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-lg bg-brand-surface-muted border border-brand-surface-border/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy-500 block">
                        Operational Hours
                      </span>
                      <span className="text-sm font-bold text-brand-navy-950 mt-0.5 block">
                        24 Hours Open
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">All 7 Days · Day & Night Shifts</span>
                    </div>

                    <div className="p-3 rounded-lg bg-brand-surface-muted border border-brand-surface-border/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy-500 block">
                        Monthly Access
                      </span>
                      <span className="text-sm font-bold text-brand-navy-950 mt-0.5 block">
                        Starting at ₹500
                      </span>
                      <span className="text-[11px] text-brand-gold-700 font-medium">Affordable Plans</span>
                    </div>
                  </div>

                  {/* Discipline Guarantee Banner */}
                  <div className="p-3 rounded-lg bg-brand-navy-950 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-xs font-semibold">
                        Pin-Drop Silence Guaranteed
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-gold-300 uppercase tracking-wider bg-brand-navy-900 px-2 py-0.5 rounded border border-brand-navy-800">
                      Zero Noise
                    </span>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. WHO IS LIBRARY HUB FOR? (EXAM ASPIRANTS SECTION) */}
      <section className="py-10 sm:py-14 bg-brand-surface border-b border-brand-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Tailored for Your Preparation"
            title="Engineered for Every Serious Aspirant"
            description="Whether you are writing long mock papers, watching live online classes, or solving math drills, find the exact environment you need."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Civil Services & State PCS */}
            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border shadow-soft hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Civil Services
              </span>
              <h3 className="text-lg font-heading font-extrabold text-brand-navy-950 mb-2">
                UPPSC & UPSC Aspirants
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy-700 leading-relaxed">
                Quiet space for standard book reading (NCERT, Laxmikanth, Spectrum), detailed notes making, and distraction-free answer writing practice.
              </p>
              <div className="mt-4 pt-3 border-t border-brand-surface-border flex items-center gap-1.5 text-xs text-brand-navy-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Deep focus for 10–12 hour study marathons</span>
              </div>
            </div>

            {/* 2. SSC & Central Exams */}
            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border shadow-soft hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Laptop className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                Speed & Mock Tests
              </span>
              <h3 className="text-lg font-heading font-extrabold text-brand-navy-950 mb-2">
                SSC, Banking & Railway
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy-700 leading-relaxed">
                Seamless dual-band optical Wi-Fi and individual charging points for timed online mock tests, test series analysis, and speed drills.
              </p>
              <div className="mt-4 pt-3 border-t border-brand-surface-border flex items-center gap-1.5 text-xs text-brand-navy-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero lag during live online test submissions</span>
              </div>
            </div>

            {/* 3. Medical & Engineering */}
            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border shadow-soft hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Intensive Practice
              </span>
              <h3 className="text-lg font-heading font-extrabold text-brand-navy-950 mb-2">
                NEET UG & JEE Students
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy-700 leading-relaxed">
                Spacious individual desks to lay out biology modules, physics question banks, and chemistry charts without feeling cramped.
              </p>
              <div className="mt-4 pt-3 border-t border-brand-surface-border flex items-center gap-1.5 text-xs text-brand-navy-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Glare-free reading light & cool AC comfort</span>
              </div>
            </div>

            {/* 4. State & Teaching Exams */}
            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border shadow-soft hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                State Recruitment
              </span>
              <h3 className="text-lg font-heading font-extrabold text-brand-navy-950 mb-2">
                UP Police & Teaching (TET)
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy-700 leading-relaxed">
                Consistent daily revision routines for UP Police SI/Constable, Super TET, CTET, and B.Ed/D.El.Ed semester preparation.
              </p>
              <div className="mt-4 pt-3 border-t border-brand-surface-border flex items-center gap-1.5 text-xs text-brand-navy-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Day & night shifts built around jobs</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. RELATABLE COMPARISON: STUDYING AT HOME VS. LIBRARY HUB */}
      <section className="py-10 sm:py-14 bg-brand-surface-muted/50 border-b border-brand-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="The Reality Check"
            title="Studying at Home vs. Studying at Library Hub"
            description="Notice the life-changing difference when you step out of a distracting room into a dedicated sanctuary of serious learners."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* The Home Struggle */}
            <div className="p-6 sm:p-8 rounded-card bg-white border border-red-200/80 shadow-soft space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-brand-navy-950">
                    The Struggle of Studying at Home
                  </h3>
                  <span className="text-xs text-red-600 font-semibold">Low Productivity · Inconsistent Hours</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-brand-navy-800">
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Frequent Interruption:</strong> Family chores, unannounced visitors, household noise, and loud TV sounds in the background.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Power Cuts & Heat:</strong> Sudden electricity cuts disrupting online classes, laptop battery dying, and oppressive summer heat.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>The Comfort Trap:</strong> Studying on bed leads to drowsiness, frequent phone scrolling, and zero accountability.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Erratic Study Rhythm:</strong> Studying 4 hours on Monday and struggling to manage even 1 hour on Tuesday.</span>
                </li>
              </ul>
            </div>

            {/* The Library Hub Sanctuary */}
            <div className="p-6 sm:p-8 rounded-card bg-brand-navy-950 text-white border-2 border-brand-gold-500 shadow-soft-lg space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold-500/20 text-brand-gold-400 flex items-center justify-center font-bold shrink-0 border border-brand-gold-500/40">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                    The Library Hub Advantage
                  </h3>
                  <span className="text-xs text-brand-gold-300 font-semibold">Unbroken Focus · 10+ Productive Hours</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-brand-navy-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Strict Pin-Drop Silence:</strong> Zero noise tolerance inside reading hall. Every minute is dedicated strictly to studies.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">24/7 Power Backup & AC:</strong> Continuous inverter and generator backup guarantees non-stop light, charging, and cool AC comfort.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Dedicated Study Cubicle:</strong> Ergonomic chair, individual socket, and personal partition for laser focus.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Peer Inspiration:</strong> Seeing 40+ fellow aspirants deeply immersed in books fuels your internal drive to work harder.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PILLARS / CORE STUDY VALUES */}
      <section className="py-10 sm:py-14 bg-brand-surface border-b border-brand-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Core Philosophy"
            title="Engineered for Unbroken Concentration"
            description="Every detail at Library Hub Nawalpur is purposefully designed to help students spend hours in deep, productive learning without friction."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={VolumeX}
              badge="Strict Discipline"
              title="Pin-Drop Silence"
              description="Strictly enforced quiet zones ensure your focus remains entirely on books and lecture material without chatter or disturbance."
            />
            <FeatureCard
              icon={Armchair}
              badge="Physical Comfort"
              title="Ergonomic Desks"
              description="Individual partitioned study cabins, cushioned posture chairs, and glare-free lighting designed for 8–14 hour study marathons."
            />
            <FeatureCard
              icon={Zap}
              badge="Reliability"
              title="Zero Interruptions"
              description="High-speed optical Wi-Fi and automatic power backup keep your mock tests and online preparation running smoothly."
            />
            <FeatureCard
              icon={ShieldCheck}
              badge="Safety First"
              title="Secure & Monitored"
              description="24/7 CCTV surveillance and reception supervision ensure a safe, disciplined sanctuary for all learners, especially female students."
            />
          </div>
        </div>
      </section>

      {/* 5. MEMBERSHIP PREVIEW (UPDATED 3 PLANS) */}
      <section className="py-10 sm:py-14 bg-brand-surface-muted/50 border-b border-brand-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Study Shifts & Plans"
            title="Flexible Memberships Tailored to Your Routine"
            description="Whether you study during the day (7 AM – 8 PM), through the night (8 PM – 8 AM), or need 24-hour round-the-clock access, choose a plan that matches your routine."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {previewPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                title={plan.title}
                tagline={plan.tagline}
                price={plan.price}
                period={plan.period}
                timings={plan.timings}
                features={plan.features}
                isPopular={plan.isPopular}
                isPriceAnnounced={plan.isPriceAnnounced}
                badgeText={plan.badgeText}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-brand-navy-600 mb-3 font-medium">
              *All plans include AC comfort, individual charging points, optical Wi-Fi, and RO drinking water. Pay at desk with zero hidden charges.
            </p>
            <Button to="/membership" variant="secondary" icon={ArrowRight} iconPosition="right">
              View Detailed Plan Comparison
            </Button>
          </div>
        </div>
      </section>

      {/* 6. FACILITIES PREVIEW */}
      <section className="py-10 sm:py-14 bg-brand-surface border-b border-brand-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Comfort & Infrastructure"
            title="Everything You Need for 10+ Hour Study Days"
            description="We provide the modern infrastructure and comfortable environment essential for long hours of productive study."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                icon={facility.icon}
                title={facility.title}
                description={facility.description}
                category={facility.category}
                isConfirmed={facility.isConfirmed}
                highlights={facility.highlights}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button to="/facilities" variant="secondary" size="lg" icon={ArrowRight} iconPosition="right">
              View All Facilities & Amenities
            </Button>
          </div>
        </div>
      </section>

      {/* 7. STUDY SPACES SHOWCASE */}
      <section className="py-10 sm:py-14 bg-brand-surface-muted/40 border-b border-brand-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Study Spaces"
            title="Designed for Deep Immersion"
            description="Take a preview of our planned study zones. Actual library interior photographs will be updated here once provided."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImagePlaceholder
              src={libraryImages.readingRoom.src}
              alt={libraryImages.readingRoom.alt}
              label="Air-Conditioned Reading Hall"
              subtext="Actual photo to be added by owner"
              aspectRatio="aspect-[4/3]"
              category="Main Hall"
            />
            <ImagePlaceholder
              src={libraryImages.desks.src}
              alt={libraryImages.desks.alt}
              label="Individual Study Cabins & Overhead Lockers"
              subtext="Actual wooden study cabins with key-locked personal lockers"
              aspectRatio="aspect-[4/3]"
              category="Actual Desks"
              objectFit="object-cover"
              imageClassName="object-top"
            />
            <ImagePlaceholder
              src={libraryImages.quietZone.src}
              alt={libraryImages.quietZone.alt}
              label="Dedicated Silence Zone"
              subtext="Actual photo to be added by owner"
              aspectRatio="aspect-[4/3]"
              category="Quiet Zone"
            />
          </div>

          <div className="mt-8 p-4 rounded-xl bg-brand-surface-card border border-brand-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-navy-700 font-medium shadow-soft-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold-600 shrink-0" />
              <span>Real photography of desks, cabins, and reading hall will replace these placeholders upon owner provision.</span>
            </div>
            <Link to="/gallery" className="font-bold text-brand-gold-700 hover:text-brand-gold-800 transition-colors shrink-0">
              Explore Full Gallery →
            </Link>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS / STUDENT FEEDBACK */}
      <section className="py-10 sm:py-14 bg-brand-surface border-b border-brand-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Verified Google Reviews"
            title="What Aspirants Say About Library Hub Nawalpur"
            description="Real 5-star experiences and feedback shared by students studying at Library Hub Nawalpur on Google Maps."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.map((review) => (
              <TestimonialCard
                key={review.id}
                quote={review.quote}
                author={review.author}
                initial={review.initial}
                avatarBg={review.avatarBg}
                reviewInfo={review.reviewInfo}
                timeAgo={review.timeAgo}
                rating={review.rating}
                likes={review.likes}
                source={review.source}
                isVerified={review.isVerified}
              />
            ))}
          </div>

          {/* Google Reviews Trust Bar */}
          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={siteConfig.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-brand-surface-card border border-brand-surface-border text-xs sm:text-sm font-semibold text-brand-navy-900 hover:border-brand-gold-500 hover:text-brand-navy-950 transition-all shadow-soft-sm hover:shadow-soft group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Rated <strong>5.0 Stars</strong> on Google Maps</span>
              <span className="text-brand-navy-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* 9. FAQ PREVIEW */}
      <section className="py-10 sm:py-14 bg-brand-surface-muted/40 border-b border-brand-surface-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Got Questions?"
            title="Frequently Asked Questions"
            description="Quick answers about daily hours, study desks, admission guidelines, and library facilities."
          />

          <FaqAccordion items={previewFaqs} defaultOpenIndex={0} />

          <div className="mt-8 text-center">
            <Link
              to="/faqs"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-navy-950 hover:text-brand-gold-600 transition-colors"
            >
              <span>Have more questions? Read our full FAQ directory</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. MOTIVATIONAL CTA BANNER */}
      <section className="relative overflow-hidden bg-brand-navy-950 text-white py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C79A2B_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-gold-500/10 text-brand-gold-300 border border-brand-gold-500/30">
            <Flame className="w-3.5 h-3.5 text-brand-gold-400" />
            <span>Seats Allotted on First-Come, First-Served Basis</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white max-w-3xl mx-auto">
            Ready to Build an Unbreakable Study Habit in Nawalpur?
          </h2>

          <p className="text-sm sm:text-base text-brand-navy-200 max-w-2xl mx-auto leading-relaxed">
            Visit Library Hub Nawalpur to tour our reading hall, inspect our ergonomic study desks, and reserve your dedicated seat.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 max-w-md mx-auto sm:max-w-none">
            <Button
              to="/contact"
              variant="gold"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto font-bold shadow-soft"
            >
              Send Admission Inquiry
            </Button>
            <Button
              to="/rules"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-white border-brand-navy-700 hover:bg-brand-navy-900"
            >
              Review Library Rules
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
