/**
 * Billing Arithmetic and Date Calculation Engine for Library Hub Nawalpur.
 * 
 * Rules:
 * 1. Financial amounts MUST be represented as integer paise (1 INR = 100 paise).
 * 2. Billing cycle anchors to the member's joining date.
 * 3. Month-end dates (29th-31st) clamp to the last valid day of shorter months,
 *    and restore to the anchor date in 31-day months.
 */

export const rupeesToPaise = (rupees) => {
  if (typeof rupees === 'string') {
    rupees = parseFloat(rupees.replace(/[^\d.-]/g, ''));
  }
  if (isNaN(rupees) || rupees < 0) {
    throw new Error(`Invalid rupee amount: ${rupees}`);
  }
  return Math.round(rupees * 100);
};

export const paiseToRupees = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return paise / 100;
};

export const formatPaiseAsRupees = (paise) => {
  const rupees = paiseToRupees(paise);
  return `₹${rupees.toLocaleString('en-IN')}`;
};

/**
 * Returns the number of days in a specific year and month (1-indexed month: 1=Jan, 12=Dec).
 */
export const getDaysInMonth = (year, month) => {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

/**
 * Calculates the next billing cycle start and end date based on an anchor joining date.
 * 
 * @param {Date} joiningDate - The original membership anchor date
 * @param {number} cycleIndex - The 0-based cycle index (0 = first month, 1 = second month, etc.)
 * @returns {{ periodStart: Date, periodEnd: Date, issueDate: Date, dueDate: Date }}
 */
export const calculateBillingCycle = (joiningDate, cycleIndex = 0) => {
  const anchorDate = new Date(joiningDate);
  if (isNaN(anchorDate.getTime())) {
    throw new Error('Invalid joining date provided');
  }

  const anchorYear = anchorDate.getUTCFullYear();
  const anchorMonth = anchorDate.getUTCMonth(); // 0-indexed
  const anchorDay = anchorDate.getUTCDate();

  // Target start year and month
  const totalStartMonths = anchorMonth + cycleIndex;
  const startYear = anchorYear + Math.floor(totalStartMonths / 12);
  const startMonth = (totalStartMonths % 12 + 12) % 12; // 0-indexed
  const maxDaysInStartMonth = getDaysInMonth(startYear, startMonth + 1);
  const clampedStartDay = Math.min(anchorDay, maxDaysInStartMonth);

  const periodStart = new Date(Date.UTC(startYear, startMonth, clampedStartDay, 0, 0, 0, 0));

  // Target end year and month (1 month after start)
  const totalEndMonths = startMonth + 1;
  const endYear = startYear + Math.floor(totalEndMonths / 12);
  const endMonth = (totalEndMonths % 12 + 12) % 12;
  const maxDaysInEndMonth = getDaysInMonth(endYear, endMonth + 1);
  const clampedEndDay = Math.min(anchorDay, maxDaysInEndMonth);

  // Period end is the start of next cycle minus 1 millisecond
  const periodEnd = new Date(Date.UTC(endYear, endMonth, clampedEndDay, 23, 59, 59, 999));

  // Issue date is cycle start; Due date is standard 3 days after issue
  const issueDate = new Date(periodStart);
  const dueDate = new Date(periodStart);
  dueDate.setUTCDate(dueDate.getUTCDate() + 3);

  return {
    periodStart,
    periodEnd,
    issueDate,
    dueDate,
  };
};

/**
 * Calculates next billing date given a current date and the member's anchor day (1-31).
 * Clamps to month end if the target month has fewer days.
 */
export const calculateNextBillingDate = (currentDate, anchorDay = 1) => {
  const d = new Date(currentDate);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-11

  // Advance 1 month
  const nextMonthTotal = month + 1;
  const nextYear = year + Math.floor(nextMonthTotal / 12);
  const nextMonth = nextMonthTotal % 12;
  const daysInNextMonth = getDaysInMonth(nextYear, nextMonth + 1);
  const targetDay = Math.min(anchorDay, daysInNextMonth);

  return new Date(Date.UTC(nextYear, nextMonth, targetDay, 0, 0, 0, 0));
};

/**
 * Calculate due date given issue date and grace days.
 */
export const calculateDueDate = (issueDate, graceDays = 7) => {
  const due = new Date(issueDate);
  due.setUTCDate(due.getUTCDate() + graceDays);
  return due;
};

/**
 * Generates an invoice number like INV-YYYYMMDD-XXXX
 */
export const generateInvoiceNumber = (prefix = 'INV', date = new Date()) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}${month}${day}-${rand}`;
};

/**
 * Generates a receipt number like RCP-YYYYMMDD-XXXX
 */
export const generateReceiptNumber = (prefix = 'RCP', date = new Date()) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}${month}${day}-${rand}`;
};

/**
 * Formats a Date object to YYYY-MM-DD in UTC or target timezone.
 */
export const formatDateKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default {
  rupeesToPaise,
  paiseToRupees,
  formatPaiseAsRupees,
  getDaysInMonth,
  calculateBillingCycle,
  calculateNextBillingDate,
  calculateDueDate,
  generateInvoiceNumber,
  generateReceiptNumber,
  formatDateKey,
};
