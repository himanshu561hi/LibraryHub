import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Accessible Breadcrumb navigation with consistent visual styling.
 */
export default function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-brand-navy-600 hover:text-brand-gold-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-brand-surface-border shrink-0" aria-hidden="true" />
              {isLast || !item.to ? (
                <span className="font-semibold text-brand-navy-950" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-brand-navy-600 hover:text-brand-gold-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

