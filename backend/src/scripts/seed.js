import mongoose from 'mongoose';
import config from '../config/index.js';
import { Admin, SiteSetting } from '../models/index.js';
import logger from '../utils/logger.js';

export const runSeed = async () => {
  try {
    logger.info('Starting Library Hub database seed...');
    await mongoose.connect(config.mongo.uri, config.mongo.options);

    // 1. Check or create Super Admin
    const existingAdmin = await Admin.findOne({ email: config.seedAdmin.email.toLowerCase() });
    if (!existingAdmin) {
      const passwordHash = await Admin.hashPassword(config.seedAdmin.password);
      const newAdmin = await Admin.create({
        name: config.seedAdmin.name,
        email: config.seedAdmin.email.toLowerCase(),
        passwordHash,
        role: 'super_admin',
        isActive: true,
      });
      logger.info(`Super Admin seeded successfully: ${newAdmin.email}`);
    } else {
      logger.info(`Super Admin already exists: ${existingAdmin.email} (Skipped creation)`);
    }

    // 2. Seed Default Site Settings (Pricing & Hours)
    const defaultSettings = [
      {
        key: 'pricing_plans',
        value: {
          morningShift: { feeInPaise: 60000, name: 'Morning Shift Plan (6 AM – 2 PM)' },
          fullDayPass: { feeInPaise: 100000, name: 'Full Day Dedicated Plan (6 AM – 10 PM)' },
          eveningShift: { feeInPaise: 60000, name: 'Evening Shift Plan (2 PM – 10 PM)' },
        },
        description: 'Standard monthly membership shift fees in integer paise',
      },
      {
        key: 'operating_hours',
        value: '6:00 AM – 10:00 PM (All 7 Days Open)',
        description: 'Official Library Hub operational schedule',
      },
      {
        key: 'attendance_policy',
        value: {
          dailyCodeExpiryHours: 24,
          maxAttemptsBeforeLockout: 5,
        },
        description: 'Daily code attendance verification parameters',
      },
    ];

    for (const setting of defaultSettings) {
      await SiteSetting.findOneAndUpdate(
        { key: setting.key },
        { $setOnInsert: setting },
        { upsert: true, new: true }
      );
    }
    logger.info('Default Site Settings seeded successfully.');

    logger.info('Database seed completed successfully!');
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

