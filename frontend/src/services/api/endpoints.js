/**
 * Centralized API Endpoints registry for Library Hub Nawalpur.
 * Used for future backend integration.
 */
export const API_ENDPOINTS = {
  // Authentication (future admin/student portal)
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },

  // Inquiries and Admissions
  INQUIRIES: {
    SUBMIT: '/inquiries',
    LIST: '/inquiries',
    DETAILS: (id) => `/inquiries/${id}`,
  },

  // Membership & Pricing Plans
  MEMBERSHIPS: {
    PLANS: '/memberships/plans',
    SLOTS: '/memberships/slots',
    AVAILABILITY: '/memberships/availability',
  },

  // Facilities & Amenities
  FACILITIES: {
    LIST: '/facilities',
  },

  // Reviews and Testimonials
  REVIEWS: {
    LIST: '/reviews',
    SUBMIT: '/reviews',
  },

  // Site Configuration & Contact
  CONFIG: {
    BUSINESS_INFO: '/config/business-info',
  },
};

