import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Info,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import FacilityCard from '../components/common/FacilityCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { facilitiesData } from '../data/facilities';

const categories = ['All', 'Study Environment', 'Connectivity', 'Comfort', 'Security', 'Amenities'];

export default function FacilitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFacilities = useMemo(() => {
    return facilitiesData.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex-1 py-8 sm:py-10 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb & Hero */}
        <section className="space-y-6">
          <Breadcrumb items={[{ label: 'Facilities' }]} />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>World-Class Infrastructure in Nawalpur</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-brand-navy-950 tracking-tight leading-tight">
              Designed for Non-Stop Productivity
            </h1>

            <p className="text-base sm:text-lg text-brand-navy-700 leading-relaxed">
              Every facility at Library Hub Nawalpur is selected and maintained to eliminate study friction. Experience high-speed internet, silent air conditioning, continuous power backup, and ergonomic study desks.
            </p>
          </div>
        </section>

        {/* Verification Status Notice */}
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Owner Verification Note:</strong> Core facilities like AC, Wi-Fi, and power backup are standard. Specific optional services (such as personal locker allocations) are marked subject to owner confirmation.
            </span>
          </div>
          <span className="font-semibold px-2.5 py-0.5 rounded bg-amber-200/60 text-amber-950 text-[11px] shrink-0">
            Verified Standards
          </span>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-brand-navy-900 text-white shadow-soft-sm'
                      : 'bg-brand-surface-card text-brand-navy-700 border border-brand-surface-border hover:bg-brand-surface-muted hover:border-brand-surface-borderHover'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-brand-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-brand-surface-card border border-brand-surface-border text-brand-navy-900 placeholder:text-brand-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 transition-colors shadow-soft-sm"
              />
            </div>
          </div>
        </div>

        {/* Facility Grid */}
        <section>
          {filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
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
          ) : (
            <div className="text-center py-16 bg-brand-surface-card rounded-2xl border border-brand-surface-border p-8">
              <p className="text-sm font-heading font-bold text-brand-navy-900 mb-2">
                No facilities match your search query
              </p>
              <p className="text-xs text-brand-navy-500 mb-4">
                Try searching for "Wi-Fi", "AC", "Power", or reset the filter.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </section>

        {/* Facility Highlights Callout */}
        <section className="p-8 sm:p-10 rounded-2xl bg-brand-navy-950 text-white grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-gold-400 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              <span>Zero Power Cuts</span>
            </div>
            <p className="text-xs text-brand-navy-200 leading-relaxed">
              Automatic power failover protects your desktop tests and ensures your laptop battery never runs dry mid-revision.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-gold-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe Study Environment</span>
            </div>
            <p className="text-xs text-brand-navy-200 leading-relaxed">
              Monitored premises with high-resolution CCTV to provide students and parents complete peace of mind.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-gold-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hygienic Maintenance</span>
            </div>
            <p className="text-xs text-brand-navy-200 leading-relaxed">
              Desks, reading chairs, and washroom areas are sanitized and maintained on a strict daily schedule.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center bg-brand-surface-muted/60 p-8 sm:p-12 rounded-2xl border border-brand-surface-border space-y-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-brand-navy-950">
            Want to See These Facilities in Person?
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy-600 max-w-xl mx-auto">
            You are always welcome to visit our premises in Nawalpur, check the desk comfort, and speak to our administrator.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Button
              to="/contact"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Schedule a Free Visit
            </Button>
            <Button
              to="/membership"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              View Membership Shifts
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
