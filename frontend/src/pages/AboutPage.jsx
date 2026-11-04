import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Target,
  Compass,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ImagePlaceholder from '../components/common/ImagePlaceholder';
import { siteConfig } from '../data/siteConfig';
import { libraryImages } from '../data/images';

export default function AboutPage() {
  return (
    <div className="flex-1 py-6 sm:py-8 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* Unified Hero & Story Showcase */}
        <section className="space-y-4">
          <Breadcrumb items={[{ label: 'About Us' }]} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
            
            {/* Left Narrative (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-300 shadow-soft-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
                <span>Nawalpur's Dedicated Study Space</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-black text-brand-navy-950 tracking-tight leading-tight">
                A Calm, Modern Sanctuary Built for Focused Minds
              </h1>

              <p className="text-base sm:text-lg text-brand-navy-800 leading-relaxed font-medium">
                Library Hub Nawalpur was established with a singular focus: to provide serious students and competitive exam aspirants with the undisturbed physical space, modern amenities, and disciplined atmosphere required to turn long study hours into actual results.
              </p>

              <div className="pt-3 border-t border-brand-surface-border space-y-3.5 text-xs sm:text-sm text-brand-navy-700 leading-relaxed">
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-brand-navy-950">
                  Why We Started Library Hub in Nawalpur
                </h2>
                
                <p>
                  Every student preparing for high-stakes competitive exams—whether it’s UPSC, State PSC, NEET, JEE, CA, Banking, or academic board exams—knows that dedication alone isn’t enough. The environment you sit in every single day dictates whether you retain 4 hours of reading or 10 hours of deep understanding.
                </p>

                <p>
                  At home, students battle recurring interruptions: family chatter, television noise, unexpected guests, power outages, and unreliable Wi-Fi. In coffee shops, it’s noisy and expensive. In traditional municipal reading rooms, seating is often cramped, lack power sockets, or suffer from poor ventilation.
                </p>

                <p className="font-semibold text-brand-navy-950 border-l-2 border-brand-gold-500 pl-4 py-2 italic bg-brand-gold-50/60 rounded-r-lg">
                  "We built Library Hub Nawalpur to be the quiet refuge where you can sit down at 6 AM, immerse yourself in books, and study without a single distraction until the day is done."
                </p>
              </div>
            </div>

            {/* Right Showcase: Real Study Desks (5 cols) */}
            <div className="lg:col-span-5 space-y-3.5 lg:pt-14">
              <div className="p-3 bg-brand-surface-card rounded-card border-2 border-brand-surface-border shadow-soft-lg space-y-3">
                <ImagePlaceholder
                  src={libraryImages.desks.src}
                  alt="Library Hub Nawalpur - Individual Wooden Study Cabins with Personal Overhead Lockers"
                  label="Individual Study Cabins & Overhead Lockers"
                  subtext="Actual wooden study cabins with personal key-locked lockers at Library Hub Nawalpur"
                  aspectRatio="aspect-[4/3]"
                  category="Actual Study Cabins"
                  objectFit="object-cover"
                  imageClassName="object-top"
                  className="rounded-lg shadow-sm"
                />

                <div className="p-2.5 rounded-lg bg-brand-surface-muted border border-brand-surface-border text-xs text-brand-navy-700 space-y-1">
                  <div className="flex items-center justify-between font-bold text-brand-navy-950">
                    <span>Library Hub Nawalpur Desks</span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified On-Site
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-navy-600 leading-snug">
                    Each seat features an individual privacy partition, personal book storage, and overhead key-locked locker.
                  </p>
                </div>
              </div>

              {/* Quick Assurance Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-brand-surface-card border border-brand-surface-border flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-brand-navy-900">100% Noise-Free</span>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-surface-card border border-brand-surface-border flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-gold-500 shrink-0" />
                  <span className="font-semibold text-brand-navy-900">Personal Lockers</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Mission and Vision Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-card bg-brand-navy-950 text-white shadow-soft-lg border border-brand-navy-900 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-navy-900 text-brand-gold-400 flex items-center justify-center border border-brand-navy-800">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Our Core Mission
            </h3>
            <p className="text-sm text-brand-navy-200 leading-relaxed">
              To empower every ambitious student in Nawalpur with an affordable, world-class study environment that guarantees strict discipline, total silence, ergonomic comfort, and complete physical safety.
            </p>
          </div>

          <div className="p-8 rounded-card bg-brand-surface-card text-brand-navy-950 border border-brand-surface-border shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-gold-50 text-brand-gold-800 flex items-center justify-center border border-brand-gold-200">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-brand-navy-950">
              Our Vision
            </h3>
            <p className="text-sm text-brand-navy-700 leading-relaxed">
              To be the most trusted study hub in the region—fostering a vibrant community of high-achievers who inspire each other through quiet perseverance and shared dedication.
            </p>
          </div>
        </section>

        {/* Home vs Library Hub Comparison */}
        <section className="bg-brand-surface-muted/60 p-8 sm:p-12 rounded-2xl border border-brand-surface-border space-y-8">
          <SectionHeading
            subtitle="The Productive Difference"
            title="Studying at Home vs. Studying at Library Hub Nawalpur"
            description="See why switching to a dedicated study hub dramatically improves study consistency and memory retention."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Home Study Box */}
            <div className="p-6 rounded-card bg-white border border-rose-200/80 shadow-soft-sm space-y-4">
              <div className="flex items-center gap-2.5 text-rose-700 font-semibold text-base">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>Typical Home Study Challenges</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-brand-navy-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  Frequent interruptions from family members and visitors
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  Noise from neighborhood traffic, street vendors, and television
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  Frequent temptation to relax, sleep, or browse social media
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  Inconsistent electricity and Wi-Fi dropouts during tests
                </li>
              </ul>
            </div>

            {/* Library Hub Box */}
            <div className="p-6 rounded-card bg-brand-navy-950 text-white border border-brand-gold-500/50 shadow-soft-md space-y-4">
              <div className="flex items-center gap-2.5 text-brand-gold-300 font-semibold text-base">
                <CheckCircle2 className="w-5 h-5 text-brand-gold-400 shrink-0" />
                <span>The Library Hub Advantage</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-brand-navy-200">
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold-400 font-bold">✓</span>
                  100% enforced pin-drop silence and zero social chatter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold-400 font-bold">✓</span>
                  Ergonomic study cabins with personal lights and plug points
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold-400 font-bold">✓</span>
                  A focused peer group that keeps you motivated and accountable
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold-400 font-bold">✓</span>
                  Continuous inverter backup and dual-band optical Wi-Fi
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-8">
          <SectionHeading
            subtitle="Our Cultural Pillars"
            title="The Values That Guide Our Space"
            description="We believe an exceptional library is defined by the discipline and respect of its community."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border">
              <div className="w-10 h-10 rounded-lg bg-brand-navy-50 text-brand-navy-900 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h4 className="text-base font-heading font-bold text-brand-navy-950 mb-1">
                Sacred Silence
              </h4>
              <p className="text-xs sm:text-sm text-brand-navy-600">
                We protect your mental flow by strictly eliminating whispered chatter and audio leaks.
              </p>
            </div>

            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border">
              <div className="w-10 h-10 rounded-lg bg-brand-navy-50 text-brand-navy-900 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h4 className="text-base font-heading font-bold text-brand-navy-950 mb-1">
                Mutual Respect
              </h4>
              <p className="text-xs sm:text-sm text-brand-navy-600">
                Every aspirant’s preparation journey is respected equally, regardless of exam or course.
              </p>
            </div>

            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border">
              <div className="w-10 h-10 rounded-lg bg-brand-navy-50 text-brand-navy-900 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h4 className="text-base font-heading font-bold text-brand-navy-950 mb-1">
                Uncompromising Hygiene
              </h4>
              <p className="text-xs sm:text-sm text-brand-navy-600">
                Clean study desks, spotless washrooms, and sanitized drinking water at all times.
              </p>
            </div>

            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border">
              <div className="w-10 h-10 rounded-lg bg-brand-navy-50 text-brand-navy-900 flex items-center justify-center font-bold mb-4">
                04
              </div>
              <h4 className="text-base font-heading font-bold text-brand-navy-950 mb-1">
                Consistent Support
              </h4>
              <p className="text-xs sm:text-sm text-brand-navy-600">
                Attentive on-site management ready to address maintenance or seating needs immediately.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="p-8 sm:p-12 rounded-2xl bg-brand-navy-950 text-white text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-heading font-black text-white">
            Experience Library Hub Nawalpur in Person
          </h2>
          <p className="text-sm sm:text-base text-brand-navy-200 max-w-xl mx-auto">
            We welcome you to visit our facility in Nawalpur, inspect our study cubicles, and choose your preferred study shift.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md mx-auto sm:max-w-none">
            <Button
              to="/contact"
              variant="gold"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Plan Your Visit
            </Button>
            <Button
              to="/facilities"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-white border-brand-navy-700 hover:bg-brand-navy-900"
            >
              View Amenities
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
