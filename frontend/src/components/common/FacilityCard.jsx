import React from 'react';
import { Check } from 'lucide-react';
import Badge from './Badge';

/**
 * Facility Card displaying amenity details with clear verification status.
 * Features subtle hover lift and smooth icon micro-interaction.
 */
export default function FacilityCard({
  icon: Icon,
  title,
  description,
  category,
  isConfirmed = true,
  highlights = [],
  className = '',
}) {
  return (
    <div
      className={`h-full p-6 rounded-card bg-brand-surface-card border border-brand-surface-border transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-md hover:border-brand-gold-300 group flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-surface-muted text-brand-navy-900 border border-brand-surface-border flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-brand-gold-300 group-hover:text-brand-gold-600 group-hover:bg-brand-gold-50/50">
            {Icon && <Icon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-1" />}
          </div>

          <div className="flex flex-col items-end gap-1">
            {isConfirmed ? (
              <Badge variant="emerald" size="xs" hasDot>
                Available
              </Badge>
            ) : (
              <Badge variant="amber" size="xs" hasDot>
                Subject to confirmation
              </Badge>
            )}
            {category && (
              <span className="text-[10px] text-brand-navy-400 font-medium">
                {category}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-heading font-extrabold text-brand-navy-950 mb-2 group-hover:text-brand-navy-900 transition-colors">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-brand-navy-600 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {highlights && highlights.length > 0 && (
        <ul className="pt-3 border-t border-brand-surface-border/60 space-y-1.5 text-xs text-brand-navy-700">
          {highlights.map((point, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-brand-gold-600 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
