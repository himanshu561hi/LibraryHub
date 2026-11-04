import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: [true, 'Payment number is required'],
      unique: true,
      index: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeInvoice',
      required: [true, 'Invoice ID is required'],
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
    amountInPaise: {
      type: Number,
      required: [true, 'Payment amount in paise is required'],
      min: [100, 'Minimum payment amount is ₹1.00 (100 paise)'],
    },
    paidAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER'],
      default: 'CASH',
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    recordedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },
    isReversed: {
      type: Boolean,
      default: false,
      index: true,
    },
    reversalReason: {
      type: String,
      default: null,
    },
    reversedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reversedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre('validate', function (next) {
  if (!this.recordedByAdminId && this.recordedBy) {
    this.recordedByAdminId = this.recordedBy;
  }
  if (!this.recordedBy && this.recordedByAdminId) {
    this.recordedBy = this.recordedByAdminId;
  }
  if (!this.recordedByAdminId) {
    this.recordedByAdminId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
    this.recordedBy = this.recordedByAdminId;
  }
  next();
});

paymentSchema.index({ invoiceId: 1, isReversed: 1 });
paymentSchema.index({ userId: 1, paidAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

