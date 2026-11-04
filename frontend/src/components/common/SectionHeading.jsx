import React from 'react';
import { motion } from 'framer-motion';

/**
 * Standardized Section Heading with consistent hierarchy, typography, and optional CTA/badge.
 * Features a subtle, performant scroll-reveal animation.
 */
export default function SectionHeading({
  badge,
  subtitle,
  title,
  description,
  alignment = 'center',
  action,
  light = false,
  className = '',
}) {
  const isCentered = alignment === 'center';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`mb-6 sm:mb-8 ${
        isCentered ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'
      } ${className}`}
    >
      {badge && <div className="mb-3">{badge}</div>}

      {subtitle && (
        <span
          className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
            light ? 'text-brand-gold-400' : 'text-brand-gold-600'
          }`}
        >
          {subtitle}
        </span>
      )}

      {title && (
        <h2
          className={`text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight leading-tight mb-3 ${
            light ? 'text-white' : 'text-brand-navy-950'
          }`}
        >
          {title}
        </h2>
      )}

      {description && (
        <p
          className={`text-sm sm:text-base leading-relaxed ${
            light ? 'text-brand-navy-200' : 'text-brand-navy-700'
          }`}
        >
          {description}
        </p>
      )}

      {action && !isCentered && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
