import React from 'react';
import { Camera } from 'lucide-react';

/**
 * Image Placeholder / Real Image renderer.
 * When `src` is provided (after owner uploads photos), it smoothly renders the actual photo.
 * When `src` is empty, it renders an intentional, high-fidelity placeholder indicating that
 * the real photograph will be provided by the owner.
 */
export default function ImagePlaceholder({
  src = null,
  alt = 'Library Hub Nawalpur photo placeholder',
  label = 'Library Photograph Placeholder',
  subtext = 'Actual photograph will be supplied by library owner',
  aspectRatio = 'aspect-video', // 'aspect-video' | 'aspect-[4/3]' | 'aspect-square' | 'aspect-[16/10]'
  category,
  className = '',
  imageClassName = '',
  objectFit = 'object-cover', // 'object-cover' | 'object-contain'
  overlayContent = null,
}) {
  // If real image is supplied
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-card bg-white ${aspectRatio} ${className}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-full ${objectFit} transition-transform duration-500 hover:scale-[1.02] ${imageClassName}`}
        />
        {category && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-navy-950/85 text-brand-gold-300 backdrop-blur-sm border border-white/10 shadow-soft-sm">
              {category}
            </span>
          </div>
        )}
        {overlayContent}
      </div>
    );
  }

  // Placeholder presentation
  return (
    <div
      className={`relative overflow-hidden rounded-card bg-gradient-to-br from-brand-surface-muted via-brand-surface to-brand-surface-muted/90 border border-brand-surface-border p-6 flex flex-col items-center justify-center text-center group select-none shadow-soft-sm ${aspectRatio} ${className}`}
      aria-label={`${label} - ${subtext}`}
    >
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0F2238_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Category Pill */}
      {category && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-brand-navy-900/10 text-brand-navy-800 border border-brand-navy-900/15">
            {category}
          </span>
        </div>
      )}

      {/* Center Icon & Notice */}
      <div className="relative z-10 flex flex-col items-center max-w-xs px-4">
        <div className="w-12 h-12 rounded-xl bg-brand-surface-card border border-brand-surface-border flex items-center justify-center text-brand-navy-700 shadow-soft-sm mb-3 group-hover:scale-105 transition-transform">
          <Camera className="w-6 h-6 text-brand-navy-600" />
        </div>

        <p className="font-heading font-bold text-sm sm:text-base text-brand-navy-900 leading-snug mb-1">
          {label}
        </p>

        <p className="text-[11px] sm:text-xs text-brand-navy-500 leading-relaxed">
          {subtext}
        </p>
      </div>

      {overlayContent}
    </div>
  );
}

