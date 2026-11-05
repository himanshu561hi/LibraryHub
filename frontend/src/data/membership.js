/**
 * Membership plans and study shifts for Library Hub Nawalpur.
 * 
 * Official monthly pricing:
 * - Day Shift (7:00 AM – 8:00 PM): ₹500/month
 * - Night Shift (8:00 PM – 8:00 AM): ₹600/month
 * - 24 Hours Dedicated (Round the Clock 24×7): ₹800/month
 */
export const membershipPlans = [
  {
    id: 'day-shift',
    title: 'Day Shift Plan',
    tagline: 'Ideal for full daytime preparation & competitive exam study.',
    price: '₹500',
    period: 'month',
    isPriceAnnounced: true,
    isPopular: false,
    timings: '7:00 AM – 8:00 PM (13 Hours)',
    features: [
      'Dedicated study seat for day shift (13 Hours)',
      'High-speed dual-band optical Wi-Fi',
      'Individual desk socket & charging point',
      'Air-conditioned quiet reading hall',
      'RO purified chilled drinking water',
      '100% continuous power backup',
      'CCTV monitored safe environment',
    ],
  },
  {
    id: 'full-day-24h',
    title: '24 Hours Dedicated Plan',
    tagline: 'Maximum focus with uninterrupted 24×7 round-the-clock access.',
    price: '₹800',
    period: 'month',
    isPriceAnnounced: true,
    isPopular: true,
    badgeText: 'Most Popular',
    timings: '24 Hours (Round the Clock / 24×7)',
    features: [
      'Guaranteed dedicated desk reserved 24×7',
      'Study anytime day or night without time limits',
      'High-speed dual-band optical Wi-Fi',
      'Individual charging socket & reading lamp',
      'Priority access to personal book locker',
      '100% power backup & continuous AC comfort',
      'Access to relaxation & refreshment zone',
    ],
  },
  {
    id: 'night-shift',
    title: 'Night Shift Plan',
    tagline: 'Zero distractions for late-night study & working professionals.',
    price: '₹600',
    period: 'month',
    isPriceAnnounced: true,
    isPopular: false,
    timings: '8:00 PM – 8:00 AM (12 Hours)',
    features: [
      'Dedicated study seat for night shift (12 Hours)',
      'Peaceful, undisturbed overnight study ambience',
      'High-speed dual-band optical Wi-Fi',
      'Individual desk socket & charging point',
      'Air-conditioned quiet reading hall',
      'RO purified chilled drinking water',
      '24/7 CCTV surveillance & safe premises',
    ],
  },
];
