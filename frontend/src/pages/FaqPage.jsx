import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ArrowRight,
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import FaqAccordion from '../components/common/FaqAccordion';
import Button from '../components/common/Button';
import { faqsData } from '../data/faqs';
import { siteConfig } from '../data/siteConfig';

const faqCategories = ['All', 'Timings & Access', 'Membership', 'Facilities', 'Discipline', 'Admissions'];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    return faqsData.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'All' || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex-1 py-8 sm:py-10 bg-brand-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb & Hero */}
        <section className="space-y-6">
          <Breadcrumb items={[{ label: 'Frequently Asked Questions' }]} />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-200">
              <HelpCircle className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Questions & Answers</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-brand-navy-950 tracking-tight leading-tight">
              Frequently Asked Questions
            </h1>

            <p className="text-base sm:text-lg text-brand-navy-700 leading-relaxed">
              Find quick answers about study shift hours, desk allocation, admission rules, Wi-Fi connectivity, and library policies.
            </p>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-brand-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-brand-surface-card border border-brand-surface-border text-brand-navy-900 placeholder:text-brand-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 transition-colors shadow-soft-sm"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <section>
          {filteredFaqs.length > 0 ? (
            <FaqAccordion items={filteredFaqs} defaultOpenIndex={0} allowMultiple={true} />
          ) : (
            <div className="text-center py-16 bg-brand-surface-card rounded-2xl border border-brand-surface-border p-8">
              <p className="text-base font-heading font-bold text-brand-navy-900 mb-2">
                No questions found matching your search
              </p>
              <p className="text-xs text-brand-navy-500 mb-4">
                Try searching with different terms or reset your filter.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Clear Search Filter
              </Button>
            </div>
          )}
        </section>

        {/* Still Have Questions Card */}
        <section className="p-6 sm:p-8 rounded-2xl bg-brand-surface-card border border-brand-surface-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-extrabold text-brand-navy-950">
              Have a specific question not covered here?
            </h3>
            <p className="text-xs sm:text-sm text-brand-navy-600">
              Our team in Nawalpur is always glad to help you understand seat options, shift rules, or visit timings.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Button to="/contact" variant="primary" icon={ArrowRight} iconPosition="right">
              Contact Reception
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
