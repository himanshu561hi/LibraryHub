import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Universal Button component supporting Link, anchor, and native button elements.
 * Features accessible focus states, variants, sizes, and subtle tactile feedback.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-brand-navy-900 text-white hover:bg-brand-navy-800 hover:-translate-y-0.5 active:bg-brand-navy-950 active:translate-y-0 focus-visible:ring-brand-navy-900 shadow-soft-sm hover:shadow-soft',
    secondary:
      'bg-brand-surface-card text-brand-navy-900 border border-brand-surface-border hover:bg-brand-surface-muted hover:-translate-y-0.5 hover:border-brand-surface-borderHover active:translate-y-0 focus-visible:ring-brand-navy-700 shadow-soft-sm',
    gold:
      'bg-brand-gold-500 text-brand-navy-950 hover:bg-brand-gold-400 hover:-translate-y-0.5 active:bg-brand-gold-600 active:translate-y-0 focus-visible:ring-brand-gold-500 font-bold shadow-soft-sm hover:shadow-soft',
    outline:
      'bg-transparent text-brand-navy-800 border border-brand-surface-border hover:bg-brand-surface-muted/60 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-brand-navy-700',
    ghost:
      'bg-transparent text-brand-navy-700 hover:text-brand-navy-950 hover:bg-brand-surface-muted/60 focus-visible:ring-brand-navy-700',
    white:
      'bg-white text-brand-navy-950 hover:bg-brand-surface-muted hover:-translate-y-0.5 active:bg-brand-surface-border active:translate-y-0 focus-visible:ring-white shadow-soft',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1.5 gap-1.5',
    sm: 'text-xs sm:text-sm px-3.5 py-2 gap-1.5',
    md: 'text-sm px-4 sm:px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const combinedClasses = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
}

