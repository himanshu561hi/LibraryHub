import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      default: null,
    },
    // Library-local date string 'YYYY-MM-DD' in Asia/Kolkata
    date: {
      type: String,
      required: [true, 'Local date is required'],
      index: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    inTime: {
      type: Date,
      required: [true, 'IN timestamp is required'],
    },
    outTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['IN', 'COMPLETED'],
      default: 'IN',
      index: true,
    },
    inConfirmedByEmail: {
      type: Boolean,
      default: false,
    },
    outConfirmedByEmail: {
      type: Boolean,
      default: false,
    },
    codeDateUsed: {
      type: String,
      default: null,
    },
    autoCheckedOut: {
      type: Boolean,
      default: false,
    },
    manualCorrections: [
      {
        correctedByAdminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Admin',
          required: true,
        },
        correctedAt: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          required: true,
        },
        previousInTime: Date,
        previousOutTime: Date,
        previousStatus: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One IN and one OUT per user per library-local date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

