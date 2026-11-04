import mongoose from 'mongoose';

const feeInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      index: true,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: [true, 'Membership ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    // Unique period key to enforce idempotency per billing cycle: e.g. "MEM_ID_2025-01-15"
    periodKey: {
      type: String,
      required: true,
      index: true,
    },
    billingPeriodStart: {
      type: Date,
      required: [true, 'Billing period start date is required'],
    },
    billingPeriodEnd: {
      type: Date,
      required: [true, 'Billing period end date is required'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    feeAmountInPaise: {
      type: Number,
      required: [true, 'Fee amount in paise is required'],
      min: 0,
    },
    adjustmentsInPaise: {
      type: Number,
      default: 0,
    },
    amountPaidInPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceInPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overdue', 'void'],
      default: 'unpaid',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    voidReason: {
      type: String,
      default: null,
    },
    voidedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce duplicate invoice prevention per membership and billing period
feeInvoiceSchema.index({ membershipId: 1, periodKey: 1 }, { unique: true });
feeInvoiceSchema.index({ userId: 1, status: 1 });
feeInvoiceSchema.index({ dueDate: 1, status: 1 });

export const FeeInvoice = mongoose.model('FeeInvoice', feeInvoiceSchema);
export default FeeInvoice;

