import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Clean Feature Card highlighting a key aspect of the study hub.
 * Features subtle tactile lift and icon highlight transitions.
 */
export default function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  link,
  className = '',
}) {
  const content = (
    <div
      className={`h-full p-6 sm:p-7 rounded-card bg-brand-surface-card border border-brand-surface-border transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-md hover:border-brand-gold-300 group flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-navy-50 text-brand-navy-900 border border-brand-navy-100 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-navy-900 group-hover:text-brand-gold-400 group-hover:shadow-soft-sm">
            {Icon && <Icon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-1" />}
          </div>
          {badge && (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-200">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-heading font-extrabold text-brand-navy-950 mb-2 group-hover:text-brand-navy-900 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-brand-navy-600 leading-relaxed">
          {description}
        </p>
      </div>

      {link && (
        <div className="pt-4 mt-4 border-t border-brand-surface-border/60 flex items-center gap-1.5 text-xs font-semibold text-brand-navy-700 group-hover:text-brand-gold-600 transition-colors">
          <span>{link.label || 'Learn more'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      )}
    </div>
  );

  if (link && link.to) {
    return (
      <Link to={link.to} className="block h-full focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
