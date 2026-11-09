/**
 * Centralized API Endpoints registry for Library Hub Nawalpur.
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    GOOGLE: '/auth/google',
    ADMIN_LOGIN: '/auth/admin/login',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },

  // Public
  PUBLIC: {
    ANNOUNCEMENTS: '/public/announcements',
    REGISTER: '/public/register',
    APPLICATION_STATUS: (query) => `/public/application-status/${encodeURIComponent(query)}`,
  },

  // Dashboards
  DASHBOARD: {
    STUDENT: '/dashboard/student',
    ADMIN_SUMMARY: '/dashboard/admin/summary',
    ADMIN_DAILY_CODE: '/dashboard/admin/daily-code',
  },

  // Memberships Lifecycle
  MEMBERSHIPS: {
    LIST: '/memberships',
    CREATE: '/memberships',
    DETAILS: (id) => `/memberships/${id}`,
    UPDATE: (id) => `/memberships/${id}`,
    DEACTIVATE: (id) => `/memberships/${id}/deactivate`,
    REACTIVATE: (id) => `/memberships/${id}/reactivate`,
    UPDATE_FEE: (id) => `/memberships/${id}/fee`,
  },

  // Attendance & Daily Code
  ATTENDANCE: {
    CHECK_IN: '/attendance/check-in',
    CHECK_OUT: '/attendance/check-out',
    TODAY_STATUS: '/attendance/today',
    MY_HISTORY: '/attendance/history',
    ADMIN_LIVE: '/attendance/admin/live',
    ADMIN_CORRECT: (id) => `/attendance/admin/${id}/correct`,
  },

  // Fees, Invoices & Manual Payments
  BILLING: {
    INVOICES: '/billing/invoices',
    INVOICE_DETAILS: (id) => `/billing/invoices/${id}`,
    RECORD_PAYMENT: '/billing/payments',
    PAYMENT_HISTORY: '/billing/payments',
    REVERSE_PAYMENT: (id) => `/billing/payments/${id}/reverse`,
    OUTSTANDING_DUES: '/billing/dues',
    SEND_FEE_REMINDER: '/billing/dues/remind',
  },

  // Email Campaigns
  EMAIL: {
    SEND_CAMPAIGN: '/email/campaigns',
    CAMPAIGNS_LIST: '/email/campaigns',
    CAMPAIGN_DETAILS: (id) => `/email/campaigns/${id}`,
    PREVIEW_AUDIENCE: '/email/preview-audience',
  },

  // Reports and Audit Logs
  ADMIN: {
    STUDENTS: '/admin/students',
    STUDENT_DETAILS: (id) => `/admin/students/${id}`,
    AUDIT_LOGS: '/admin/audit-logs',
    EMAIL_LOGS: '/admin/email-logs',
    EMAIL_LOG_DETAILS: (id) => `/admin/email-logs/${id}`,
    RESEND_EMAIL: (id) => `/admin/email-logs/${id}/resend`,
    SETTINGS: '/admin/settings',
    APPLICATIONS: '/admin/applications',
    APPROVE_APPLICATION: (id) => `/admin/applications/${id}/approve`,
    REJECT_APPLICATION: (id) => `/admin/applications/${id}/reject`,
    REPORTS_COLLECTIONS: '/admin/reports/collections',
    REPORTS_ATTENDANCE: '/admin/reports/attendance',
    EXPORT_CSV: (type) => `/admin/export/${type}`,
  },
};

export default API_ENDPOINTS;
