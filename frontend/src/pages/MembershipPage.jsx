import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import PricingCard from '../components/common/PricingCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { membershipPlans } from '../data/membership';

export default function MembershipPage() {
  const navigate = useNavigate();

  const handleSelectPlan = (planTitle) => {
    // Navigate to contact with prefilled shift preference via state
    navigate('/contact', { state: { selectedShift: planTitle } });
  };

  return (
    <div className="flex-1 py-8 sm:py-10 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb & Hero */}
        <section className="space-y-6">
          <Breadcrumb items={[{ label: 'Membership Plans' }]} />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Shift-Based & Full-Day Memberships</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-brand-navy-950 tracking-tight leading-tight">
              Study On Your Own Terms
            </h1>

            <p className="text-base sm:text-lg text-brand-navy-700 leading-relaxed">
              Choose the study shift that seamlessly integrates with your coaching schedule, college lectures, or revision goals. Every membership guarantees a calm, dedicated desk with high-speed Wi-Fi and air conditioning.
            </p>
          </div>
        </section>

        {/* Pricing Policy Disclaimer Banner */}
        <div className="p-4 sm:p-5 rounded-xl bg-brand-navy-950 text-brand-navy-200 border border-brand-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <Info className="w-4 h-4 text-brand-gold-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold text-white">Transparent Pricing:</span>
              <p className="text-brand-navy-300 mt-0.5">
                Affordable monthly plans starting at just ₹600/month. No online transactions; reserve your seat and complete registration at the desk.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-navy-900 text-brand-gold-300 border border-brand-navy-800 shrink-0 font-medium">
            <span>No Online Payments · Pay at Desk</span>
          </div>
        </div>

        {/* Pricing Grid */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {membershipPlans.map((plan) => (
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
                onEnquire={() => handleSelectPlan(plan.title)}
              />
            ))}
          </div>
        </section>

        {/* Shift Comparison Table */}
        <section className="bg-brand-surface-card rounded-2xl border border-brand-surface-border p-6 sm:p-8 shadow-soft space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-brand-navy-950 mb-1">
              Detailed Shift Comparison
            </h2>
            <p className="text-xs sm:text-sm text-brand-navy-600">
              Compare features across morning, full-day, and evening study shifts.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-brand-surface-border text-brand-navy-900 bg-brand-surface-muted/50">
                  <th className="py-3 px-4 font-semibold">Feature / Amenity</th>
                  <th className="py-3 px-4 font-semibold">Morning Shift</th>
                  <th className="py-3 px-4 font-semibold text-brand-gold-700 bg-brand-gold-50/50">Full Day (Popular)</th>
                  <th className="py-3 px-4 font-semibold">Evening Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-surface-border text-brand-navy-700">
                <tr>
                  <td className="py-3 px-4 font-medium text-brand-navy-950">Daily Study Hours</td>
                  <td className="py-3 px-4">8 Hours (6 AM - 2 PM)</td>
                  <td className="py-3 px-4 font-semibold text-brand-navy-900 bg-brand-gold-50/20">16 Hours (6 AM - 10 PM)</td>
                  <td className="py-3 px-4">8 Hours (2 PM - 10 PM)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-brand-navy-950">Reserved Fixed Desk</td>
                  <td className="py-3 px-4">Fixed for shift</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 bg-brand-gold-50/20">Dedicated 24/7 Desk</td>
                  <td className="py-3 px-4">Fixed for shift</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-brand-navy-950">Air Conditioned Comfort</td>
                  <td className="py-3 px-4 text-emerald-700">Included</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 bg-brand-gold-50/20">Included</td>
                  <td className="py-3 px-4 text-emerald-700">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-brand-navy-950">Dual-Band Optical Wi-Fi</td>
                  <td className="py-3 px-4 text-emerald-700">Included</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 bg-brand-gold-50/20">Included</td>
                  <td className="py-3 px-4 text-emerald-700">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-brand-navy-950">Individual Desk Socket</td>
                  <td className="py-3 px-4 text-emerald-700">Included</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 bg-brand-gold-50/20">Included</td>
                  <td className="py-3 px-4 text-emerald-700">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-brand-navy-950">Personal Book Locker</td>
                  <td className="py-3 px-4 text-brand-navy-500">Optional add-on</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 bg-brand-gold-50/20">Priority Allocation</td>
                  <td className="py-3 px-4 text-brand-navy-500">Optional add-on</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-brand-navy-950">Monthly Admission Fee</td>
                  <td className="py-3 px-4 text-brand-navy-950 font-bold">₹600 / month</td>
                  <td className="py-3 px-4 font-bold text-brand-gold-700 bg-brand-gold-50/20">₹1000 / month</td>
                  <td className="py-3 px-4 text-brand-navy-950 font-bold">₹600 / month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Admission Process / Steps */}
        <section className="space-y-8">
          <SectionHeading
            subtitle="Getting Started"
            title="How to Enroll at Library Hub Nawalpur"
            description="Our admission procedure is simple, transparent, and student-friendly."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border">
              <span className="text-2xl font-heading font-black text-brand-gold-600 block mb-2">01</span>
              <h3 className="text-base font-heading font-bold text-brand-navy-950 mb-1">
                Tour the Reading Hall
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy-600 leading-relaxed">
                Visit our Nawalpur library, inspect the available cabins, and test the lighting, Wi-Fi, and chairs.
              </p>
            </div>

            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border">
              <span className="text-2xl font-heading font-black text-brand-gold-600 block mb-2">02</span>
              <h3 className="text-base font-heading font-bold text-brand-navy-950 mb-1">
                Select Your Shift & Desk
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy-600 leading-relaxed">
                Pick your preferred study hours (Morning, Evening, or Full Day) and choose an available desk number.
              </p>
            </div>

            <div className="p-6 rounded-card bg-brand-surface-card border border-brand-surface-border">
              <span className="text-2xl font-heading font-black text-brand-gold-600 block mb-2">03</span>
              <h3 className="text-base font-heading font-bold text-brand-navy-950 mb-1">
                Start Studying Right Away
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy-600 leading-relaxed">
                Complete basic student registration, receive your ID pass, and begin uninterrupted preparation.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="p-8 sm:p-12 rounded-2xl bg-brand-navy-950 text-white text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Have Questions About Shifts or Desk Availability?
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy-200 max-w-lg mx-auto">
            Our administrator is ready to assist you. Send an inquiry or visit our reception desk in Nawalpur.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Button
              to="/contact"
              variant="gold"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Submit Shift Inquiry
            </Button>
            <Button
              to="/faqs"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-white border-brand-navy-700 hover:bg-brand-navy-900"
            >
              Read Admission FAQs
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
