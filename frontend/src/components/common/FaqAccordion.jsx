import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Accessible FAQ Accordion component with animated smooth disclosure and keyboard support.
 */
export default function FaqAccordion({
  items = [],
  defaultOpenIndex = 0,
  allowMultiple = false,
  className = '',
}) {
  const [openIndices, setOpenIndices] = useState(
    defaultOpenIndex !== null ? [defaultOpenIndex] : []
  );

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndices((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndices.includes(index);
        const itemId = `faq-item-${index}`;
        const contentId = `faq-content-${index}`;

        return (
          <div
            key={index}
            className={`rounded-card border transition-all duration-300 ${
              isOpen
                ? 'bg-brand-surface-card border-brand-gold-300 shadow-soft-sm'
                : 'bg-brand-surface-card/80 border-brand-surface-border hover:border-brand-surface-borderHover hover:shadow-soft-sm'
            }`}
          >
            <h3>
              <button
                type="button"
                id={itemId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleItem(index)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-500 rounded-card"
              >
                <div className="flex items-center gap-3">
                  {item.category && (
                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-surface-muted text-brand-navy-600">
                      {item.category}
                    </span>
                  )}
                  <span className="font-heading font-bold text-sm sm:text-base text-brand-navy-950">
                    {item.question}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen
                      ? 'bg-brand-navy-900 text-white rotate-180 shadow-soft-sm'
                      : 'bg-brand-surface-muted text-brand-navy-600'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={contentId}
                  role="region"
                  aria-labelledby={itemId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-brand-navy-700 leading-relaxed border-t border-brand-surface-border/40">
                    <p>{item.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
