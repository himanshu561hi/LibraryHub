import mongoose from 'mongoose';

const emailRecipientLogSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailCampaign',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    recipientName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['QUEUED', 'SENT', 'FAILED', 'SKIPPED_UNSUBSCRIBED'],
      default: 'QUEUED',
      index: true,
    },
    error: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailRecipientLogSchema.index({ campaignId: 1, status: 1 });

export const EmailRecipientLog = mongoose.model('EmailRecipientLog', emailRecipientLogSchema);
export default EmailRecipientLog;

