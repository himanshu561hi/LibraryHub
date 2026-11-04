import {
  rupeesToPaise,
  paiseToRupees,
  formatPaiseAsRupees,
  calculateBillingCycle,
  getDaysInMonth,
} from '../src/utils/billingCalculator.js';
import { User, Membership, FeeInvoice, Attendance } from '../src/models/index.js';

describe('Phase 02: Financial Arithmetic & Month-End Billing Cycle Engine', () => {
  describe('Integer Currency Conversion (Paise Rules)', () => {
    it('converts Rupee values to exact integer paise without floating point issues', () => {
      expect(rupeesToPaise(600)).toBe(60000);
      expect(rupeesToPaise(1000)).toBe(100000);
      expect(rupeesToPaise('₹600')).toBe(60000);
      expect(rupeesToPaise(499.99)).toBe(49999);
      expect(rupeesToPaise(0)).toBe(0);
    });

    it('converts paise to Rupee value accurately', () => {
      expect(paiseToRupees(60000)).toBe(600);
      expect(paiseToRupees(100000)).toBe(1000);
      expect(paiseToRupees(49999)).toBe(499.99);
    });

    it('formats paise with standard Indian Rupee symbol', () => {
      expect(formatPaiseAsRupees(60000)).toBe('₹600');
      expect(formatPaiseAsRupees(100000)).toBe('₹1,000');
    });

    it('throws error on negative or invalid rupee inputs', () => {
      expect(() => rupeesToPaise(-50)).toThrow();
      expect(() => rupeesToPaise('invalid')).toThrow();
    });
  });

  describe('Month-End Date Clamping Logic (29th, 30th, 31st)', () => {
    it('accurately identifies max days in leap and non-leap years', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29); // 2024 is leap
      expect(getDaysInMonth(2025, 2)).toBe(28); // 2025 is standard
      expect(getDaysInMonth(2025, 4)).toBe(30); // April
      expect(getDaysInMonth(2025, 1)).toBe(31); // January
    });

    it('clamps 31st joining date to 28th in February, 30th in April, and restores to 31st in May', () => {
      const joiningDate = new Date('2025-01-31T00:00:00.000Z');

      // Cycle 0: Jan 31 -> Feb 28
      const cycle0 = calculateBillingCycle(joiningDate, 0);
      expect(cycle0.periodStart.getUTCDate()).toBe(31);
      expect(cycle0.periodStart.getUTCMonth()).toBe(0); // Jan
      expect(cycle0.periodEnd.getUTCDate()).toBe(28); // Feb 28
      expect(cycle0.periodEnd.getUTCMonth()).toBe(1); // Feb

      // Cycle 1: Feb 28 -> Mar 31
      const cycle1 = calculateBillingCycle(joiningDate, 1);
      expect(cycle1.periodStart.getUTCDate()).toBe(28); // Clamped in Feb
      expect(cycle1.periodEnd.getUTCDate()).toBe(31); // Restored in March!
      expect(cycle1.periodEnd.getUTCMonth()).toBe(2); // March

      // Cycle 2: Mar 31 -> Apr 30
      const cycle2 = calculateBillingCycle(joiningDate, 2);
      expect(cycle2.periodStart.getUTCDate()).toBe(31); // Mar 31
      expect(cycle2.periodEnd.getUTCDate()).toBe(30); // Apr 30
      expect(cycle2.periodEnd.getUTCMonth()).toBe(3); // April

      // Cycle 3: Apr 30 -> May 31
      const cycle3 = calculateBillingCycle(joiningDate, 3);
      expect(cycle3.periodStart.getUTCDate()).toBe(30); // Clamped in Apr
      expect(cycle3.periodEnd.getUTCDate()).toBe(31); // Restored in May!
      expect(cycle3.periodEnd.getUTCMonth()).toBe(4); // May
    });

    it('anchors mid-month joining dates consistently (e.g. 15th)', () => {
      const joiningDate = new Date('2025-03-15T00:00:00.000Z');
      const cycle0 = calculateBillingCycle(joiningDate, 0);

      expect(cycle0.periodStart.getUTCDate()).toBe(15);
      expect(cycle0.periodStart.getUTCMonth()).toBe(2); // March
      expect(cycle0.periodEnd.getUTCDate()).toBe(15);
      expect(cycle0.periodEnd.getUTCMonth()).toBe(3); // April
    });
  });

  describe('Mongoose Schema Validation Rules', () => {
    it('validates User model required fields', () => {
      const user = new User({});
      const validationError = user.validateSync();
      expect(validationError.errors.email).toBeDefined();
      expect(validationError.errors.name).toBeDefined();
    });

    it('validates Attendance date string format (YYYY-MM-DD)', () => {
      const validAttendance = new Attendance({
        userId: '507f1f77bcf86cd799439011',
        date: '2025-02-15',
        inTime: new Date(),
      });
      const validErr = validAttendance.validateSync();
      expect(validErr).toBeUndefined();

      const invalidAttendance = new Attendance({
        userId: '507f1f77bcf86cd799439011',
        date: '15/02/2025', // Invalid format
        inTime: new Date(),
      });
      const invalidErr = invalidAttendance.validateSync();
      expect(invalidErr.errors.date).toBeDefined();
    });

    it('validates FeeInvoice minimum financial amounts', () => {
      const invoice = new FeeInvoice({
        invoiceNumber: 'INV-TEST-001',
        membershipId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        periodKey: 'MEM_2025-01-01',
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(),
        issueDate: new Date(),
        dueDate: new Date(),
        feeAmountInPaise: 60000,
        balanceInPaise: 60000,
      });
      expect(invoice.validateSync()).toBeUndefined();
    });
  });
});

