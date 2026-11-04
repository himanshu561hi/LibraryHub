import React from 'react';

/**
 * Clean status pill / label badge.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  hasDot = false,
  className = '',
  icon: Icon,
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    default: 'bg-brand-surface-muted text-brand-navy-800 border border-brand-surface-border',
    navy: 'bg-brand-navy-900 text-brand-surface',
    gold: 'bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-200/80',
    amber: 'bg-amber-50 text-amber-900 border border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    blue: 'bg-sky-50 text-sky-800 border border-sky-200',
    outline: 'bg-transparent text-brand-navy-700 border border-brand-surface-border',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const dotColors = {
    default: 'bg-brand-navy-400',
    navy: 'bg-brand-gold-400',
    gold: 'bg-brand-gold-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-sky-500',
    outline: 'bg-brand-navy-400',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}>
      {hasDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || 'bg-current'}`}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}

