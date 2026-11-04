import mongoose from 'mongoose';

const emailCampaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, 'HTML content is required'],
    },
    textContent: {
      type: String,
      default: '',
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      enum: ['ALL', 'ACTIVE', 'INACTIVE', 'SELECTED', 'INDIVIDUAL'],
      default: 'ACTIVE',
    },
    selectedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    recipientCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'QUEUED', 'SENDING', 'COMPLETED', 'FAILED'],
      default: 'DRAFT',
      index: true,
    },
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Creating admin ID is required'],
    },
    sentAt: {
      type: Date,
      default: null,
    },
    stats: {
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      skippedUnsubscribed: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

emailCampaignSchema.index({ status: 1, createdAt: -1 });

export const EmailCampaign = mongoose.model('EmailCampaign', emailCampaignSchema);
export default EmailCampaign;

