import mongoose from 'mongoose';

const registrationApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency contact number is required'],
      trim: true,
    },
    targetExam: {
      type: String,
      required: [true, 'Target exam or purpose is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Residential address is required'],
      trim: true,
    },
    aadharFrontUrl: {
      type: String,
      required: [true, 'Aadhar card front photo is required'],
    },
    aadharFrontFileId: {
      type: String,
      default: null,
    },
    aadharBackUrl: {
      type: String,
      required: [true, 'Aadhar card back photo is required'],
    },
    aadharBackFileId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    createdUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for fullName to guarantee compatibility with both .fullName and .name
registrationApplicationSchema.virtual('fullName').get(function () {
  return this.name;
});

export const RegistrationApplication = mongoose.model(
  'RegistrationApplication',
  registrationApplicationSchema
);

export default RegistrationApplication;
