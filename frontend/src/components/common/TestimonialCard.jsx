import React from 'react';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';

/**
 * Google 'G' icon for verified reviews
 */
function GoogleLogo({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

/**
 * Testimonial Card presenting verified Google student reviews for Library Hub Nawalpur.
 */
export default function TestimonialCard({
  quote,
  author,
  initial,
  avatarBg = 'bg-brand-navy-800 text-white',
  reviewInfo,
  field,
  timeAgo,
  rating = 5,
  likes = 0,
  source = 'Google Review',
  isVerified = true,
  isSample = false,
  className = '',
}) {
  const displaySubtext = reviewInfo || field || 'Verified Student';
  const displayInitial = initial || author?.charAt(0) || 'U';

  return (
    <div
      className={`h-full p-6 sm:p-7 rounded-card bg-brand-surface-card border border-brand-surface-border shadow-soft flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-md hover:border-brand-gold-300/80 ${className}`}
    >
      <div>
        {/* Top Header: Star rating + Time ago + Google Badge */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-brand-surface-border/70">
          <div className="flex items-center gap-2">
            {/* Star rating */}
            <div className="flex items-center gap-0.5 text-amber-500" aria-label={`Rating: ${rating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? 'fill-amber-400 text-amber-500' : 'text-brand-surface-border'
                  }`}
                />
              ))}
            </div>

            {timeAgo && (
              <span className="text-xs text-brand-navy-400 font-medium">
                • {timeAgo}
              </span>
            )}
          </div>

          {/* Platform Tag */}
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-surface-muted text-brand-navy-800 border border-brand-surface-border">
              <GoogleLogo className="w-3.5 h-3.5" />
              <span>Google</span>
            </span>
          ) : isSample ? (
            <Badge variant="amber" size="xs">
              Sample Feedback
            </Badge>
          ) : null}
        </div>

        {/* Quote text */}
        <p className="text-sm text-brand-navy-900 leading-relaxed font-normal mb-6 relative">
          "{quote}"
        </p>
      </div>

      {/* Author and Engagement footer */}
      <div className="pt-4 border-t border-brand-surface-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shrink-0 shadow-soft-sm ${avatarBg}`}
          >
            {displayInitial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-brand-navy-950 truncate">
                {author}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Verified Reviewer" />
            </div>
            <span className="text-xs text-brand-navy-500 block truncate">
              {displaySubtext}
            </span>
          </div>
        </div>

        {likes > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-navy-600 bg-brand-surface-muted px-2 py-1 rounded-md border border-brand-surface-border/60 shrink-0">
            <ThumbsUp className="w-3 h-3 text-brand-navy-700" />
            <span>{likes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
