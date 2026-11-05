import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    planId: {
      type: String,
      required: [true, 'Plan ID is required'],
      enum: [
        'day-shift',
        'night-shift',
        'full-day-24h',
        '24-hours',
        'half-day-morning',
        'morning-shift',
        'full-day-pass',
        'half-day-evening',
        'evening-shift',
        'custom',
      ],
    },
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
    },
    slotType: {
      type: String,
      required: [true, 'Slot type is required'],
      enum: ['DAY', 'NIGHT', 'TWENTY_FOUR_HOURS', 'MORNING', 'FULL_DAY', 'EVENING'],
    },
    shiftTimings: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    billingAnchorDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    monthlyFeeInPaise: {
      type: Number,
      required: [true, 'Monthly fee in paise is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    effectiveDeactivationDate: {
      type: Date,
      default: null,
    },
    deactivationReason: {
      type: String,
      default: null,
    },
    deactivatedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reactivatedAt: {
      type: Date,
      default: null,
    },
    reactivatedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

membershipSchema.index({ userId: 1, status: 1 });
membershipSchema.index({ status: 1, joiningDate: 1 });

export const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;

