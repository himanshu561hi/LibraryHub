import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const dailyAttendanceCodeSchema = new mongoose.Schema(
  {
    // Date key in Asia/Kolkata ('YYYY-MM-DD')
    date: {
      type: String,
      required: [true, 'Date key is required'],
      unique: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: [true, 'Code hash is required'],
    },
    // Plain code viewable ONLY by authenticated admin on the admin attendance console
    displayCode: {
      type: String,
      required: [true, 'Display code is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    generatedBy: {
      type: String,
      default: 'SYSTEM_CRON',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify attendance code against hash
dailyAttendanceCodeSchema.methods.verifyCode = async function (plainCode) {
  if (!plainCode) return false;
  const normalized = plainCode.trim().toUpperCase();
  if (this.codeHash) {
    return bcrypt.compare(normalized, this.codeHash);
  }
  if (this.displayCode) {
    return this.displayCode === normalized;
  }
  return false;
};

// Static helper to create a hashed attendance code entry
dailyAttendanceCodeSchema.statics.createHashedCode = async function (date, plainCode, expiresAt) {
  const salt = await bcrypt.genSalt(10);
  const codeHash = await bcrypt.hash(plainCode.trim().toUpperCase(), salt);
  return this.create({
    date,
    codeHash,
    displayCode: plainCode.trim().toUpperCase(),
    expiresAt,
    isActive: true,
  });
};

export const DailyAttendanceCode = mongoose.model('DailyAttendanceCode', dailyAttendanceCodeSchema);
export default DailyAttendanceCode;

