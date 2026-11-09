import mongoose from 'mongoose';

const emailDeliveryLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    recipientName: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      default: '',
    },
    textContent: {
      type: String,
      default: '',
    },
    emailType: {
      type: String,
      enum: [
        'ADMISSION_APPROVED',
        'ADMISSION_REJECTED',
        'REGISTRATION_RECEIVED',
        'ATTENDANCE_IN',
        'ATTENDANCE_OUT',
        'PAYMENT_RECEIPT',
        'FEE_REMINDER',
        'ANNOUNCEMENT',
        'GENERAL_TRANSACTIONAL',
      ],
      default: 'GENERAL_TRANSACTIONAL',
      index: true,
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED'],
      default: 'SENT',
      index: true,
    },
    error: {
      type: String,
      default: null,
    },
    messageId: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

emailDeliveryLogSchema.index({ emailType: 1, status: 1 });
emailDeliveryLogSchema.index({ createdAt: -1 });

export const EmailDeliveryLog = mongoose.model('EmailDeliveryLog', emailDeliveryLogSchema);
export default EmailDeliveryLog;
