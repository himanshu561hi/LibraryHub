import React from 'react';
import { Check, Clock, Sparkles, ArrowRight } from 'lucide-react';
import Button from './Button';

/**
 * Membership Pricing Card with configurable plans, slot timings, and subtle hover interactions.
 */
export default function PricingCard({
  title,
  tagline,
  price = 'Price to be announced',
  period = 'per month',
  timings,
  features = [],
  isPopular = false,
  isPriceAnnounced = false,
  badgeText = 'Most Popular',
  onEnquire,
  className = '',
}) {
  return (
    <div
      className={`relative h-full rounded-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-6 sm:p-8 ${
        isPopular
          ? 'bg-brand-navy-950 text-white shadow-soft-lg ring-2 ring-brand-gold-500/80 hover:shadow-soft-xl hover:ring-brand-gold-400'
          : 'bg-brand-surface-card text-brand-navy-950 border border-brand-surface-border shadow-soft hover:shadow-soft-md hover:border-brand-gold-300/80'
      } ${className}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-gold-500 text-brand-navy-950 shadow-soft">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{badgeText}</span>
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <h3
            className={`text-xl font-heading font-extrabold mb-1.5 ${
              isPopular ? 'text-white' : 'text-brand-navy-950'
            }`}
          >
            {title}
          </h3>
          {tagline && (
            <p
              className={`text-xs sm:text-sm ${
                isPopular ? 'text-brand-navy-300' : 'text-brand-navy-600'
              }`}
            >
              {tagline}
            </p>
          )}
        </div>

        {/* Price Display */}
        <div className="mb-6 pb-6 border-b border-brand-surface-border/40">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-3xl sm:text-4xl font-heading font-extrabold tracking-tight ${
                isPopular ? 'text-brand-gold-400' : 'text-brand-navy-950'
              }`}
            >
              {price}
            </span>
            {isPriceAnnounced && (
              <span
                className={`text-xs ${
                  isPopular ? 'text-brand-navy-300' : 'text-brand-navy-500'
                }`}
              >
                / {period}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] block mt-1 font-medium ${
              isPopular ? 'text-brand-navy-400' : 'text-brand-navy-500'
            }`}
          >
            Fixed Monthly Fee · No Hidden Charges
          </span>
        </div>

        {/* Timings */}
        {timings && (
          <div
            className={`mb-6 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium ${
              isPopular
                ? 'bg-brand-navy-900/90 text-brand-gold-300 border border-brand-navy-800'
                : 'bg-brand-surface-muted text-brand-navy-800 border border-brand-surface-border'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-brand-gold-500 shrink-0" />
            <span>{timings}</span>
          </div>
        )}

        {/* Features list */}
        <div className="space-y-3 mb-8 flex-1">
          <span
            className={`text-xs font-bold uppercase tracking-wider block ${
              isPopular ? 'text-brand-gold-400' : 'text-brand-navy-500'
            }`}
          >
            Plan Includes:
          </span>
          <ul className="space-y-2.5">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isPopular
                      ? 'bg-brand-gold-500/20 text-brand-gold-400'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className={isPopular ? 'text-brand-navy-100' : 'text-brand-navy-700'}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant={isPopular ? 'gold' : 'primary'}
        size="md"
        className="w-full justify-center group"
        onClick={onEnquire}
        icon={ArrowRight}
        iconPosition="right"
      >
        <span>Reserve This Plan</span>
      </Button>
    </div>
  );
}
