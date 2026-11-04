import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Info,
  ArrowRight,
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { rulesData, rulesCategories } from '../data/rules';

export default function RulesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Guidelines');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRules = useMemo(() => {
    return rulesData.filter((rule) => {
      const matchesCategory =
        selectedCategory === 'All Guidelines' || rule.category === selectedCategory;
      const matchesSearch =
        rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex-1 py-8 sm:py-10 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb & Hero */}
        <section className="space-y-6">
          <Breadcrumb items={[{ label: 'Rules & Regulations' }]} />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-200">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Library Code of Conduct</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-brand-navy-950 tracking-tight leading-tight">
              Rules Built to Protect Your Focus
            </h1>

            <p className="text-base sm:text-lg text-brand-navy-700 leading-relaxed">
              Discipline is the cornerstone of great study results. Our guidelines exist to ensure that every member experiences an uninterrupted, silent, and hygienic sanctuary.
            </p>
          </div>
        </section>

        {/* Draft Owner Review Notice */}
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Policy Notice:</strong> These standard library rules reflect best practices for competitive exam reading rooms. Official fine amounts and specific clause wording are subject to final library owner confirmation.
            </span>
          </div>
          <span className="font-semibold px-2.5 py-0.5 rounded bg-amber-200/60 text-amber-950 text-[11px] shrink-0">
            Pending Owner Sign-Off
          </span>
        </div>

        {/* Dos and Don'ts Quick Matrix */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 sm:p-8 rounded-card bg-emerald-50/50 border border-emerald-200 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>General Study Etiquette (Do's)</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-brand-navy-800">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Maintain 100% pin-drop silence in all reading sections.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Keep mobile phones and watches strictly on silent or vibration-off.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Use headphones at low volume for all lecture videos and tests.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Arrive and vacate the study desk promptly according to shift schedule.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Keep your desk clean and dispose of all trash in designated bins.
              </li>
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-card bg-rose-50/50 border border-rose-200 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-base">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Strictly Prohibited (Don'ts)</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-brand-navy-800">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                No talking, whispering, or group discussions inside reading rooms.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                No attending phone calls at study desks (take calls outside).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                No eating food, chips, meals, or uncovered beverages at desks.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                No transferring or sharing membership passes with non-members.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                No reserving unoccupied desks by leaving random objects indefinitely.
              </li>
            </ul>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {rulesCategories.map((cat) => (
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
                placeholder="Search rule clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-brand-surface-card border border-brand-surface-border text-brand-navy-900 placeholder:text-brand-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 transition-colors shadow-soft-sm"
              />
            </div>
          </div>
        </div>

        {/* Rules Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border shadow-soft flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-surface-muted text-brand-navy-600">
                    {rule.category}
                  </span>
                  <Badge
                    variant={rule.severity === 'High Priority' ? 'amber' : 'default'}
                    size="xs"
                    hasDot
                  >
                    {rule.severity}
                  </Badge>
                </div>

                <h3 className="font-heading font-bold text-base sm:text-lg text-brand-navy-950 mb-2">
                  {rule.title}
                </h3>

                <p className="text-xs sm:text-sm text-brand-navy-700 leading-relaxed">
                  {rule.description}
                </p>
              </div>

              <div className="pt-3 border-t border-brand-surface-border/60 text-[11px] text-brand-navy-400">
                Rule ID: LH-POL-0{rule.id} · Applies to all shifts
              </div>
            </div>
          ))}
        </section>

        {/* Discipline Assurance Banner */}
        <section className="p-8 sm:p-10 rounded-2xl bg-brand-navy-950 text-white space-y-4">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
              Why We Take Discipline Seriously
            </h2>
            <p className="text-xs sm:text-sm text-brand-navy-200 leading-relaxed">
              When you pay for a dedicated self-study seat, you are paying for peace of mind. Our zero-tolerance noise enforcement guarantees that your mock test, revision, or deep reading is never ruined by someone else's phone call or discussion.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center bg-brand-surface-muted/60 p-8 sm:p-12 rounded-2xl border border-brand-surface-border space-y-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-brand-navy-950">
            Ready to Join Our Disciplined Study Community?
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy-600 max-w-xl mx-auto">
            Review our available membership shifts or submit an admission inquiry to reserve your desk.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Button
              to="/membership"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              View Membership Plans
            </Button>
            <Button
              to="/contact"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Contact Reception
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
