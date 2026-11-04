/**
 * Membership plans and study shifts for Library Hub Nawalpur.
 * 
 * Official monthly pricing:
 * - Morning Shift (6:00 AM – 2:00 PM): ₹600/month
 * - Full Day Dedicated (6:00 AM – 10:00 PM): ₹1000/month
 * - Evening Shift (2:00 PM – 10:00 PM): ₹600/month
 */
export const membershipPlans = [
  {
    id: 'half-day-morning',
    title: 'Morning Shift Plan',
    tagline: 'Ideal for early risers and morning study schedules.',
    price: '₹600',
    period: 'month',
    isPriceAnnounced: true,
    isPopular: false,
    timings: '6:00 AM – 2:00 PM (8 Hours)',
    features: [
      'Dedicated study seat for morning shift',
      'High-speed optical Wi-Fi access',
      'Individual desk socket & charging point',
      'Air-conditioned quiet reading hall',
      'RO purified drinking water',
      'CCTV monitored safe environment',
    ],
  },
  {
    id: 'full-day-pass',
    title: 'Full Day Dedicated Plan',
    tagline: 'Maximum focus for serious competitive exam preparation.',
    price: '₹1000',
    period: 'month',
    isPriceAnnounced: true,
    isPopular: true,
    badgeText: 'Most Popular',
    timings: '6:00 AM – 10:00 PM (16 Hours)',
    features: [
      'Guaranteed dedicated desk throughout the day',
      'Full-day uninterrupted study hours',
      'High-speed optical Wi-Fi access',
      'Individual charging socket & reading lamp',
      'Priority access to personal locker (optional)',
      '100% power backup & AC comfort',
      'Access to relaxation/refreshment zone',
    ],
  },
  {
    id: 'half-day-evening',
    title: 'Evening Shift Plan',
    tagline: 'Perfect for college students & working professionals.',
    price: '₹600',
    period: 'month',
    isPriceAnnounced: true,
    isPopular: false,
    timings: '2:00 PM – 10:00 PM (8 Hours)',
    features: [
      'Dedicated study seat for evening shift',
      'High-speed optical Wi-Fi access',
      'Individual desk socket & charging point',
      'Quiet, disciplined study ambience',
      'RO purified drinking water',
      'Continuous power backup',
    ],
  },
];
