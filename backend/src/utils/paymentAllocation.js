import mongoose from 'mongoose';
import { FeeInvoice, Payment, AuditLog } from '../models/index.js';
import {
  generateInvoiceNumber,
  generateReceiptNumber,
  calculateNextBillingDate,
  calculateDueDate,
  formatDateKey,
} from './billingCalculator.js';
import logger from './logger.js';

/**
 * Distributes a payment amount across invoices.
 * - Settles current / target invoice.
 * - If excess exists, pays any other unpaid invoices for this membership.
 * - If still excess, automatically generates next month(s) invoices and marks them paid or partially paid.
 * 
 * @param {Object} params
 * @param {Object} params.membership - Membership document or lean object
 * @param {Object} params.user - User document or lean object
 * @param {number} params.amountInPaise - Total amount paid in paise
 * @param {string} params.method - 'CASH', 'UPI', 'BANK_TRANSFER'
 * @param {string} params.referenceNumber - Transaction ID / Ref
 * @param {string} params.notes - Notes
 * @param {mongoose.Types.ObjectId} params.adminId - Admin recording the payment
 * @param {Date} params.paidAt - Date of payment
 * @param {mongoose.Types.ObjectId} [params.primaryInvoiceId] - Target invoice to prioritize
 */
export async function allocatePayment({
  membership,
  user,
  amountInPaise,
  method = 'CASH',
  referenceNumber = '',
  notes = '',
  adminId,
  paidAt = new Date(),
  primaryInvoiceId = null,
}) {
  const effectivePaidAt = paidAt ? new Date(paidAt) : new Date();
  const safeAdminId = adminId || new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
  let remainingPaise = parseInt(amountInPaise, 10);

  if (isNaN(remainingPaise) || remainingPaise <= 0) {
    return { payments: [], invoices: [] };
  }

  const recordedPayments = [];
  const updatedInvoices = [];

  // 1. Fetch all unpaid or partially paid invoices for this membership
  let unpaidInvoices = await FeeInvoice.find({
    membershipId: membership._id,
    status: { $in: ['unpaid', 'partially_paid'] },
    balanceInPaise: { $gt: 0 },
  }).sort({ billingPeriodStart: 1 });

  // Prioritize primaryInvoiceId if specified
  if (primaryInvoiceId) {
    const targetInv = unpaidInvoices.find((inv) => String(inv._id) === String(primaryInvoiceId));
    if (targetInv) {
      unpaidInvoices = [targetInv, ...unpaidInvoices.filter((inv) => String(inv._id) !== String(primaryInvoiceId))];
    } else {
      const specific = await FeeInvoice.findById(primaryInvoiceId);
      if (specific && specific.balanceInPaise > 0) {
        unpaidInvoices = [specific, ...unpaidInvoices];
      }
    }
  }

  // 2. Allocate payment to existing unpaid invoices
  for (const invoice of unpaidInvoices) {
    if (remainingPaise <= 0) break;

    const due = invoice.balanceInPaise;
    const allocate = Math.min(remainingPaise, due);
    const paymentNumber = generateReceiptNumber('RCP', effectivePaidAt);

    const payment = await Payment.create({
      paymentNumber,
      invoiceId: invoice._id,
      membershipId: membership._id,
      userId: user._id,
      amountInPaise: allocate,
      paidAt: effectivePaidAt,
      method: method.toUpperCase(),
      referenceNumber: referenceNumber ? referenceNumber.trim() : '',
      recordedByAdminId: safeAdminId,
      recordedBy: safeAdminId,
      notes: notes ? notes.trim() : '',
      isReversed: false,
    });

    invoice.amountPaidInPaise += allocate;
    invoice.balanceInPaise -= allocate;
    invoice.status = invoice.balanceInPaise === 0 ? 'paid' : 'partially_paid';
    await invoice.save();

    remainingPaise -= allocate;
    recordedPayments.push(payment);
    updatedInvoices.push(invoice);
  }

  // 3. If there is STILL excess payment (e.g. user gave 1000 for 500 fee),
  // automatically generate the next month(s) invoices and apply the excess!
  while (remainingPaise > 0) {
    // Find latest invoice for this membership
    const latestInvoice = await FeeInvoice.findOne({ membershipId: membership._id }).sort({ billingPeriodEnd: -1 });

    let nextPeriodStart;
    if (latestInvoice && latestInvoice.billingPeriodEnd) {
      nextPeriodStart = new Date(latestInvoice.billingPeriodEnd.getTime() + 24 * 60 * 60 * 1000);
    } else {
      nextPeriodStart = new Date();
    }

    const anchorDay = membership.billingAnchorDay || nextPeriodStart.getDate();
    const followingBill = calculateNextBillingDate(nextPeriodStart, anchorDay);
    const nextPeriodEnd = new Date(followingBill.getTime() - 24 * 60 * 60 * 1000);
    const periodKey = `${membership._id}_${formatDateKey(nextPeriodStart)}`;
    const invoiceNumber = generateInvoiceNumber('INV', nextPeriodStart);
    const dueDate = calculateDueDate(nextPeriodStart, 7);
    const monthlyFee = membership.monthlyFeeInPaise || 50000;

    const allocate = Math.min(remainingPaise, monthlyFee);
    const balance = monthlyFee - allocate;
    const status = balance === 0 ? 'paid' : 'partially_paid';

    const advanceInvoice = await FeeInvoice.create({
      invoiceNumber,
      membershipId: membership._id,
      userId: user._id,
      periodKey,
      billingPeriodStart: nextPeriodStart,
      billingPeriodEnd: nextPeriodEnd,
      issueDate: nextPeriodStart,
      dueDate,
      feeAmountInPaise: monthlyFee,
      adjustmentsInPaise: 0,
      amountPaidInPaise: allocate,
      balanceInPaise: balance,
      status,
      notes: `Advance payment generated invoice (${status === 'paid' ? 'Fully Paid' : 'Partially Paid'})`,
    });

    const paymentNumber = generateReceiptNumber('RCP', effectivePaidAt);
    const advancePayment = await Payment.create({
      paymentNumber,
      invoiceId: advanceInvoice._id,
      membershipId: membership._id,
      userId: user._id,
      amountInPaise: allocate,
      paidAt: effectivePaidAt,
      method: method.toUpperCase(),
      referenceNumber: referenceNumber ? referenceNumber.trim() : '',
      recordedByAdminId: safeAdminId,
      recordedBy: safeAdminId,
      notes: notes ? `${notes} (Advance Fee Allocation)` : 'Advance monthly fee allocation',
      isReversed: false,
    });

    remainingPaise -= allocate;
    recordedPayments.push(advancePayment);
    updatedInvoices.push(advanceInvoice);
  }

  logger.info(
    `Allocated ₹${amountInPaise / 100} across ${recordedPayments.length} payment receipts for user ${user.email}`
  );

  return {
    payments: recordedPayments,
    invoices: updatedInvoices,
    remainingPaise,
  };
}

export default { allocatePayment };
